import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
  Infinity
} from "lucide-react";

// Revolutionary Next-Gen Wallet - The Future of Digital Finance
export default function NextGenWalletPage() {
  // Revolutionary state management
  const [activeTab, setActiveTab] = useState("neural-overview");
  const [smaipinCode, setSmaipinCode] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [hologramMode, setHologramMode] = useState(false);
  const [quantumSecurity, setQuantumSecurity] = useState(true);
  const [aiTradingMode, setAiTradingMode] = useState(false);
  const [timeWarpAnalysis, setTimeWarpAnalysis] = useState(false);
  const [cosmicSync, setCosmicSync] = useState(true);
  const [neuralInterfaceActive, setNeuralInterfaceActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voiceCommandMode, setVoiceCommandMode] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);
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
    { id: "infinite-rules", label: "Infinite Rules", icon: Infinity, color: "from-cyan-500 to-blue-400" }
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  SmaiSika Neural Vault
                </h1>
                <p className="text-slate-300 font-medium">Revolutionary Next-Gen Financial Reality</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                  <span className="text-xs text-yellow-400">Quantum-Enhanced • AI-Powered • Future-Ready</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Neural Interface Controls */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-black/30 rounded-full border border-purple-500/30">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-purple-300">Hologram</span>
                  <Switch 
                    checked={hologramMode} 
                    onCheckedChange={setHologramMode}
                    className="scale-75"
                  />
                </div>
                <div className="w-px h-4 bg-purple-500/30" />
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-emerald-300">Quantum</span>
                  <Switch 
                    checked={quantumSecurity} 
                    onCheckedChange={setQuantumSecurity}
                    className="scale-75"
                  />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalancesVisible(!balancesVisible)}
                className="text-slate-300 hover:text-white p-2 rounded-full bg-black/20"
              >
                {balancesVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                  Neural Active
                </Badge>
              </div>
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
        {/* Revolutionary Neural Tab Navigation */}
        <div className="w-full overflow-x-auto mb-8">
          <div className="flex space-x-3 p-3 bg-gradient-to-r from-slate-900/80 via-purple-900/50 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 min-w-max">
            {neuralTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 min-w-fit ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl transform scale-105`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-102'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  )}
                  <IconComponent className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Revolutionary Tab Contents */}
        <div className="space-y-8">
            {/* Neural Core Overview Tab */}
            <div className={activeTab === 'neural-overview' ? 'block space-y-8' : 'hidden'}>
              {/* Quantum Balance Grid with Hologram Effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Neural Balance Display */}
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  hologramMode 
                    ? 'bg-gradient-to-br from-cyan-900/60 via-blue-900/40 to-purple-900/60 border-cyan-400/50 shadow-2xl shadow-cyan-500/20' 
                    : 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-slate-600/50'
                }`}>
                  {hologramMode && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse" />
                  )}
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-5 w-5 text-cyan-400" />
                        <span className="text-cyan-300 text-sm font-medium">Neural Balance</span>
                      </div>
                      {quantumSecurity && (
                        <div className="flex items-center space-x-1">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs text-emerald-300">Quantum Protected</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-white">
                        ꠄ {(walletBalance as any)?.smaiSika?.total?.toLocaleString() || '0'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-emerald-300">+12.5% Neural Growth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Trading Status */}
                <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/30 border-orange-700/50 relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-orange-400" />
                        <span className="text-orange-300 text-sm font-medium">AI Trading</span>
                      </div>
                      <Switch 
                        checked={aiTradingMode} 
                        onCheckedChange={setAiTradingMode}
                        className="scale-75"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {aiTradingMode ? 'ACTIVE' : 'STANDBY'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-orange-300">
                          {aiTradingMode ? 'Neural Networks Processing' : 'Awaiting Activation'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  {aiTradingMode && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" />
                  )}
                </Card>

                {/* Time Warp Analytics */}
                <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 border-indigo-700/50 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        <span className="text-indigo-300 text-sm font-medium">Time Analysis</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setTimeWarpAnalysis(!timeWarpAnalysis)}
                        className={timeWarpAnalysis ? 'text-indigo-300' : 'text-slate-400'}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {timeWarpAnalysis ? '4D' : '3D'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Layers3 className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm text-indigo-300">
                          {timeWarpAnalysis ? 'Temporal Scanning Active' : 'Standard Timeline'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cosmic Synchronization */}
                <Card className="bg-gradient-to-br from-teal-900/50 to-blue-900/30 border-teal-700/50 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Orbit className="h-5 w-5 text-teal-400 animate-spin" />
                        <span className="text-teal-300 text-sm font-medium">Cosmic Sync</span>
                      </div>
                      <Switch 
                        checked={cosmicSync} 
                        onCheckedChange={setCosmicSync}
                        className="scale-75"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {cosmicSync ? 'SYNCED' : 'LOCAL'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Radio className="h-4 w-4 text-teal-400" />
                        <span className="text-sm text-teal-300">
                          {cosmicSync ? 'Universal Network Connected' : 'Standalone Mode'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revolutionary Neural Network Visualization */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/60 border-purple-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Atom className="h-6 w-6 mr-3 text-purple-400 animate-spin" />
                    Neural Network Activity
                    <Badge className="ml-auto bg-purple-600/20 text-purple-300 border-purple-500/30">
                      Real-Time
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Neural Activity Visualization */}
                    <div className="lg:col-span-2">
                      <canvas 
                        ref={canvasRef}
                        width={400} 
                        height={200}
                        className="w-full h-40 bg-black/20 rounded-lg border border-purple-500/20"
                      />
                      <p className="text-center text-purple-300 text-sm mt-2">
                        Neural pathways processing financial data in real-time
                      </p>
                    </div>
                    
                    {/* Neural Stats */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-300 text-sm">Processing Power</span>
                          <span className="text-white font-bold">97.3%</span>
                        </div>
                        <Progress value={97.3} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-300 text-sm">Neural Efficiency</span>
                          <span className="text-white font-bold">94.8%</span>
                        </div>
                        <Progress value={94.8} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-300 text-sm">Quantum Coherence</span>
                          <span className="text-white font-bold">89.2%</span>
                        </div>
                        <Progress value={89.2} className="h-2" />
                      </div>
                      
                      <div className="pt-4 border-t border-purple-500/20">
                        <Button 
                          onClick={() => setNeuralInterfaceActive(!neuralInterfaceActive)}
                          className={`w-full ${
                            neuralInterfaceActive 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {neuralInterfaceActive ? 'Neural Interface Active' : 'Activate Neural Interface'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hologram Vault Tab */}
            <div className={activeTab === 'hologram-vault' ? 'block space-y-8' : 'hidden'}>
              <Card className="bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-purple-900/60 border-pink-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/5 to-transparent animate-pulse" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gem className="h-6 w-6 mr-3 text-pink-400" />
                    Holographic Asset Vault
                    <Badge className="ml-auto bg-pink-600/20 text-pink-300 border-pink-500/30">
                      3D Secured
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full border-2 border-pink-500/50 flex items-center justify-center mb-6">
                        <Gem className="h-16 w-16 text-pink-400 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-2 border-pink-400/30 animate-ping" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Holographic Security Active</h3>
                    <p className="text-pink-300 mb-8 max-w-md mx-auto">
                      Your assets are protected by quantum-encrypted holographic vaults that exist in multiple dimensions simultaneously.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <div className="p-4 bg-pink-900/20 rounded-lg border border-pink-500/20">
                        <Shield className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                        <p className="text-pink-300 text-sm font-medium">Quantum Encryption</p>
                        <p className="text-pink-400/70 text-xs">Unbreakable Security</p>
                      </div>
                      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                        <Layers3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-300 text-sm font-medium">Multi-Dimensional</p>
                        <p className="text-purple-400/70 text-xs">Cross-Reality Storage</p>
                      </div>
                      <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                        <Sparkles className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-cyan-300 text-sm font-medium">Holographic Access</p>
                        <p className="text-cyan-400/70 text-xs">Immersive Interface</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Legacy Overview for old tabs */}
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
