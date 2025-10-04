import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUserAuth } from '@/context/UserAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Settings,
  Shield,
  Bell,
  Wallet,
  Bot,
  Eye,
  Brain,
  Activity,
  Zap,
  Moon,
  Sun,
  Globe,
  Save,
  Upload,
  Edit,
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TestTube,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  location: string;
  timezone: string;
  joinDate: string;
  totalTrades: number;
  successRate: number;
  preferredBots: string[];
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  tradeAlerts: boolean;
  marketUpdates: boolean;
  systemMessages: boolean;
  cosmicAlignments: boolean;
}

interface TradingPreferences {
  autoTrading: boolean;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxDailyTrades: number;
  preferredCurrency: string;
  stopLossPercentage: number;
  takeProfitPercentage: number;
}

interface ConnectorConfig {
  id: number;
  connectorCode: string;
  connectorName: string;
  connectorType: 'binary' | 'forex' | 'spot';
  selectedBot: string;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  errorMessage?: string;
  lastVerified?: string;
  createdAt: string;
}

interface MarketTypeConnector {
  code: string;
  name: string;
  status: 'operational' | 'maintenance' | 'not_implemented';
  description: string;
}

interface MarketSummary {
  binary: { total: number; operational: number; connectors: MarketTypeConnector[] };
  forex: { total: number; operational: number; connectors: MarketTypeConnector[] };
  spot: { total: number; operational: number; connectors: MarketTypeConnector[] };
}

const BOT_OPTIONS = [
  { value: 'waidbot-alpha', label: 'WaidBot α (Alpha)', type: 'binary', description: 'Binary Options Master' },
  { value: 'waidbot-pro-beta', label: 'WaidBot Pro β (Beta)', type: 'binary', description: 'Advanced Binary Trader' },
  { value: 'autonomous-trader-gamma', label: 'Autonomous Trader γ (Gamma)', type: 'forex', description: 'Forex/CFD Engine' },
  { value: 'full-engine-omega', label: 'Full Engine Ω (Omega)', type: 'spot', description: 'Spot Exchange Master' },
  { value: 'maibot', label: 'Maibot', type: 'binary', description: 'Entry-Level Learning Bot' },
];

const ProfileSettingsPage = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useUserAuth();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Nwaora Chigozie',
    email: 'nwaora@waidesai.com',
    role: 'Cosmic Intelligence Trader',
    avatar: '/api/placeholder/128/128',
    bio: 'Advanced AI trader specializing in cosmic intelligence trading with spiritual market alignment. Expert in divine intuition levels and astral projection trading techniques.',
    location: 'Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    joinDate: '2024-01-15',
    totalTrades: 1247,
    successRate: 94.2,
    preferredBots: ['Nwaora Chigozie', 'WaidBot Pro', 'Full Engine']
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    tradeAlerts: true,
    marketUpdates: true,
    systemMessages: true,
    cosmicAlignments: true
  });

  const [tradingPrefs, setTradingPrefs] = useState<TradingPreferences>({
    autoTrading: false,
    riskLevel: 'moderate',
    maxDailyTrades: 50,
    preferredCurrency: 'USD',
    stopLossPercentage: 5,
    takeProfitPercentage: 15
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Check URL hash to set active tab on mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['profile', 'notifications', 'trading', 'api-connections', 'security'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // API Connections state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMarketType, setSelectedMarketType] = useState<'binary' | 'forex' | 'spot'>('spot');
  const [selectedBot, setSelectedBot] = useState('');
  const [selectedConnector, setSelectedConnector] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [useWaidesAccount, setUseWaidesAccount] = useState(false);

  // Fetch user's connector configurations
  const { data: connectors, isLoading: connectorsLoading } = useQuery<{ connectors: ConnectorConfig[] }>({
    queryKey: ['/api/user-connectors'],
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch available connectors by market type
  const { data: marketSummary, isLoading: marketSummaryLoading } = useQuery<{ summary: MarketSummary }>({
    queryKey: ['/api/connectors/market-summary'],
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch available Waides KI managed exchanges
  const { data: waidesExchanges, isLoading: waidesExchangesLoading } = useQuery<{ 
    success: boolean;
    exchanges: Array<{
      exchangeName: string;
      availableSlots: number;
      totalSlots: number;
      usedSlots: number;
    }>;
  }>({
    queryKey: ['/api/exchange-pool/available'],
    enabled: isAuthenticated && !authLoading && useWaidesAccount,
  });

  // Create/Update connector mutation
  const createConnectorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/user-connectors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
      toast({
        title: 'Success',
        description: 'Connector added successfully',
      });
      setIsDialogOpen(false);
      resetConnectorForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add connector',
      });
    },
  });

  // Delete connector mutation
  const deleteConnectorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-connectors/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
      toast({
        title: 'Success',
        description: 'Connector deleted successfully',
      });
    },
  });

  // Test connector mutation
  const testConnectorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-connectors/${id}/test`, {
        method: 'POST',
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
      toast({
        title: data.verified ? 'Verified' : 'Test Failed',
        description: data.verified ? 'Connection verified successfully' : 'Connection verification failed',
        variant: data.verified ? 'default' : 'destructive',
      });
    },
  });

  // Toggle connector active status
  const toggleConnectorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-connectors/${id}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
    },
  });

  const resetConnectorForm = () => {
    setSelectedMarketType('spot');
    setSelectedBot('');
    setSelectedConnector('');
    setApiKey('');
    setApiSecret('');
    setUseWaidesAccount(false);
  };

  const handleSubmitConnector = () => {
    if (!selectedBot || !selectedConnector) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both a trading bot and connector',
      });
      return;
    }

    const connector = getAvailableConnectors().find(c => c.code === selectedConnector);
    if (!connector) return;

    if (useWaidesAccount) {
      // Request assignment to Waides KI managed account
      apiRequest('/api/exchange-pool/request-assignment', {
        method: 'POST',
        body: JSON.stringify({
          exchangeName: selectedConnector
        }),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
        toast({
          title: 'Success',
          description: `Successfully connected to Waides KI ${connector.name} account`,
        });
        setIsDialogOpen(false);
        resetConnectorForm();
      }).catch((error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to connect to Waides KI account',
        });
      });
    } else {
      // Use personal API keys
      if (!apiKey || !apiSecret) {
        toast({
          variant: 'destructive',
          title: 'Missing Credentials',
          description: 'Please provide API credentials',
        });
        return;
      }

      createConnectorMutation.mutate({
        connectorCode: selectedConnector,
        connectorName: connector.name,
        connectorType: selectedMarketType,
        selectedBot,
        apiKey,
        apiSecret,
        additionalCredentials: {},
      });
    }
  };

  const getAvailableConnectors = (): MarketTypeConnector[] => {
    if (!marketSummary) return [];
    
    const connectors = marketSummary.summary[selectedMarketType]?.connectors || [];
    return connectors.filter(c => c.status === 'operational');
  };

  const getCompatibleBots = () => {
    return BOT_OPTIONS.filter(bot => bot.type === selectedMarketType);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getBotLabel = (botValue: string) => {
    return BOT_OPTIONS.find(b => b.value === botValue)?.label || botValue;
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
      variant: "default",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been updated.",
      variant: "default",
    });
  };

  const handleSaveTrading = () => {
    toast({
      title: "Trading Preferences Updated",
      description: "Your trading settings have been saved.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-24 sm:pb-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-slate-700 border-slate-600"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  <p className="text-slate-300">{profile.role}</p>
                  <p className="text-sm text-slate-400">{profile.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Activity className="w-3 h-3 mr-1" />
                      {profile.totalTrades} Trades
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Brain className="w-3 h-3 mr-1" />
                      {profile.successRate}% Success Rate
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      <Zap className="w-3 h-3 mr-1" />
                      Cosmic Intelligence
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-full min-w-max lg:grid lg:grid-cols-5 bg-slate-800/50 border border-slate-700 gap-1 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 whitespace-nowrap px-3 sm:px-4">
                <User className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 whitespace-nowrap px-3 sm:px-4">
                <Bell className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 whitespace-nowrap px-3 sm:px-4">
                <Bot className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Trading</span>
              </TabsTrigger>
              <TabsTrigger value="api-connections" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 whitespace-nowrap px-3 sm:px-4">
                <LinkIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">API Connections</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300 whitespace-nowrap px-3 sm:px-4">
                <Shield className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Security</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-300">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-slate-300">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                    placeholder="Tell us about your trading experience and cosmic intelligence journey..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isDarkMode ? <Moon className="w-5 h-5 text-slate-300" /> : <Sun className="w-5 h-5 text-slate-300" />}
                    <div>
                      <p className="text-sm font-medium text-white">Theme Preference</p>
                      <p className="text-xs text-slate-400">Choose your preferred interface theme</p>
                    </div>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {key === 'emailNotifications' && <Bell className="w-5 h-5 text-slate-300" />}
                      {key === 'smsNotifications' && <Globe className="w-5 h-5 text-slate-300" />}
                      {key === 'tradeAlerts' && <Activity className="w-5 h-5 text-slate-300" />}
                      {key === 'marketUpdates' && <Brain className="w-5 h-5 text-slate-300" />}
                      {key === 'systemMessages' && <Settings className="w-5 h-5 text-slate-300" />}
                      {key === 'cosmicAlignments' && <Eye className="w-5 h-5 text-slate-300" />}
                      
                      <div>
                        <p className="text-sm font-medium text-white">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-xs text-slate-400">
                          {key === 'cosmicAlignments' && 'Spiritual market alignment and cosmic intelligence notifications'}
                          {key === 'tradeAlerts' && 'Real-time trading signals and bot activities'}
                          {key === 'marketUpdates' && 'Market analysis and price movement alerts'}
                          {key === 'emailNotifications' && 'General notifications via email'}
                          {key === 'smsNotifications' && 'Important alerts via SMS'}
                          {key === 'systemMessages' && 'System updates and maintenance notifications'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setNotifications({...notifications, [key]: checked})}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                ))}

                <Button onClick={handleSaveNotifications} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Preferences */}
          <TabsContent value="trading">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Preferences</CardTitle>
                <CardDescription>Configure your trading settings and risk management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel" className="text-slate-300">Risk Level</Label>
                    <select
                      id="riskLevel"
                      value={tradingPrefs.riskLevel}
                      onChange={(e) => setTradingPrefs({...tradingPrefs, riskLevel: e.target.value as any})}
                      className="w-full p-3 bg-slate-700 border-slate-600 text-white rounded-md"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxTrades" className="text-slate-300">Max Daily Trades</Label>
                    <Input
                      id="maxTrades"
                      type="number"
                      value={tradingPrefs.maxDailyTrades}
                      onChange={(e) => setTradingPrefs({...tradingPrefs, maxDailyTrades: parseInt(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss" className="text-slate-300">Stop Loss %</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.1"
                      value={tradingPrefs.stopLossPercentage}
                      onChange={(e) => setTradingPrefs({...tradingPrefs, stopLossPercentage: parseFloat(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit" className="text-slate-300">Take Profit %</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      step="0.1"
                      value={tradingPrefs.takeProfitPercentage}
                      onChange={(e) => setTradingPrefs({...tradingPrefs, takeProfitPercentage: parseFloat(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-5 h-5 text-slate-300" />
                    <div>
                      <p className="text-sm font-medium text-white">Auto Trading</p>
                      <p className="text-xs text-slate-400">Enable automatic trading based on AI signals</p>
                    </div>
                  </div>
                  <Switch
                    checked={tradingPrefs.autoTrading}
                    onCheckedChange={(checked) => setTradingPrefs({...tradingPrefs, autoTrading: checked})}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <Button onClick={handleSaveTrading} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Trading Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Connections */}
          <TabsContent value="api-connections">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">API Connections</CardTitle>
                    <CardDescription>Connect your broker/exchange accounts and select trading bots</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-emerald-600" data-testid="button-add-connection">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Connection
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 w-[95vw] sm:w-full">
                      <DialogHeader>
                        <DialogTitle className="text-white text-lg sm:text-xl">Add API Connection</DialogTitle>
                        <DialogDescription className="text-sm">Connect your broker/exchange account and select which trading bot to use</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4 px-1">
                        <div className="space-y-2">
                          <Label className="text-white">Market Type</Label>
                          <Select value={selectedMarketType} onValueChange={(value: any) => {
                            setSelectedMarketType(value);
                            setSelectedBot('');
                            setSelectedConnector('');
                          }}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-market-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="spot">Spot Exchange (Crypto)</SelectItem>
                              <SelectItem value="binary">Binary Options</SelectItem>
                              <SelectItem value="forex">Forex/CFD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Account Type</Label>
                          <Select value={useWaidesAccount ? 'waides' : 'personal'} onValueChange={(value) => {
                            setUseWaidesAccount(value === 'waides');
                            setSelectedConnector('');
                            setApiKey('');
                            setApiSecret('');
                          }}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-account-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="personal">My Own API Keys</SelectItem>
                              <SelectItem value="waides">Use Waides KI Account</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {useWaidesAccount && (
                          <Alert className="bg-blue-900/20 border-blue-700">
                            <AlertCircle className="h-4 w-4 text-blue-400" />
                            <AlertDescription className="text-blue-200 text-xs">
                              You'll trade using Waides KI's managed API credentials. No personal API keys needed.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label className="text-white">Trading Bot</Label>
                          <Select value={selectedBot} onValueChange={setSelectedBot}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-trading-bot">
                              <SelectValue placeholder="Select a trading bot" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {getCompatibleBots().map(bot => (
                                <SelectItem key={bot.value} value={bot.value}>
                                  {bot.label} - {bot.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Broker/Exchange</Label>
                          <Select value={selectedConnector} onValueChange={setSelectedConnector}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-connector">
                              <SelectValue placeholder="Select broker/exchange" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {getAvailableConnectors().map(connector => (
                                <SelectItem key={connector.code} value={connector.code}>
                                  {connector.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {!useWaidesAccount && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-white">API Key</Label>
                              <Input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                                className="bg-slate-800 border-slate-700 text-white"
                                data-testid="input-api-key"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-white">API Secret</Label>
                              <Input
                                type="password"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                placeholder="Enter your API secret"
                                className="bg-slate-800 border-slate-700 text-white"
                                data-testid="input-api-secret"
                              />
                            </div>

                            <Alert className="bg-blue-900/20 border-blue-700">
                              <AlertCircle className="h-4 w-4 text-blue-400" />
                              <AlertDescription className="text-blue-200 text-xs">
                                Your API credentials are encrypted and stored securely. We never access your funds directly.
                              </AlertDescription>
                            </Alert>
                          </>
                        )}
                      </div>

                      <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)} 
                          className="border-slate-700 text-white hover:bg-slate-800 w-full sm:w-auto"
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitConnector}
                          disabled={createConnectorMutation.isPending}
                          className="bg-gradient-to-r from-blue-600 to-emerald-600 w-full sm:w-auto"
                          data-testid="button-submit-connector"
                        >
                          {createConnectorMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Add Connection
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {connectorsLoading || marketSummaryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-400">Loading connections...</span>
                  </div>
                ) : connectors?.connectors && connectors.connectors.length > 0 ? (
                  <div className="space-y-4">
                    {connectors.connectors.map((connector) => (
                      <div
                        key={connector.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 gap-4"
                        data-testid={`connector-${connector.id}`}
                      >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white text-sm sm:text-base truncate">{connector.connectorName}</h3>
                              {getStatusBadge(connector.verificationStatus)}
                              {connector.isActive ? (
                                <Badge className="bg-green-600 text-xs">Active</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 break-words">
                              Trading Bot: {getBotLabel(connector.selectedBot)} • Type: {connector.connectorType.toUpperCase()}
                            </p>
                            {connector.errorMessage && (
                              <p className="text-xs text-red-400 mt-1 break-words">{connector.errorMessage}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnectorMutation.mutate(connector.id)}
                            disabled={testConnectorMutation.isPending}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm h-8 sm:h-9"
                            data-testid={`button-test-${connector.id}`}
                          >
                            <TestTube className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Test</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleConnectorMutation.mutate(connector.id)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm h-8 sm:h-9"
                            data-testid={`button-toggle-${connector.id}`}
                          >
                            {connector.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteConnectorMutation.mutate(connector.id)}
                            disabled={deleteConnectorMutation.isPending}
                            className="h-8 sm:h-9"
                            data-testid={`button-delete-${connector.id}`}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <LinkIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Connections Yet</h3>
                    <p className="text-gray-400 mb-4">Connect your first broker/exchange account to start trading</p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600"
                      data-testid="button-add-first-connection"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Connection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription>Manage your account security and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-400 mb-3">Add an extra layer of security to your account</p>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      Enable 2FA
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Change Password</h3>
                    <p className="text-sm text-slate-400 mb-3">Update your account password</p>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">API Keys</h3>
                    <p className="text-sm text-slate-400 mb-3">Manage your trading API keys and permissions</p>
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => setActiveTab('api-connections')}
                      data-testid="button-manage-api"
                    >
                      Manage API Keys
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Login History</h3>
                    <p className="text-sm text-slate-400 mb-3">Review recent login activity</p>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      View Login History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;