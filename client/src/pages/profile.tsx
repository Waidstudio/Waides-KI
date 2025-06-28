import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Brain, 
  Shield, 
  Bell, 
  Palette, 
  TrendingUp, 
  Globe, 
  Eye,
  Lock,
  Zap,
  Star,
  Target,
  Activity,
  Fingerprint,
  Cpu,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Headphones,
  Volume2,
  Mic,
  Database,
  Code,
  Webhook,
  MessageSquare,
  Calendar,
  Clock,
  Map,
  Languages,
  Mail,
  Smartphone,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Wallet,
  CreditCard,
  DollarSign,
  Percent,
  Timer,
  Layers,
  Grid,
  Sidebar,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  FileText,
  Image,
  Trash2,
  Edit3,
  Save,
  X,
  Check,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
  Copy,
  Share2,
  QrCode,
  Key,
  ShieldCheck,
  UserCheck,
  Crown,
  Trophy,
  Award,
  Medal,
  Gift,
  Gem
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: number;
  userId: number;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  timezone: string;
  language: string;
  theme: string;
  tradingStyle: string;
  riskTolerance: number;
  experienceLevel: string;
  preferredPairs: string[];
  tradingGoals: string[];
  notifications: Record<string, any>;
  privacy: Record<string, any>;
  achievements: string[];
  stats: Record<string, any>;
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  id: number;
  userId: number;
  // Trading Settings
  autoTradingEnabled: boolean;
  maxPositionSize: string;
  dailyTradingLimit: string;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  tradingHours: Record<string, any>;
  // UI/UX Settings
  chartType: string;
  chartTimeframe: string;
  dashboardLayout: Record<string, any>;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  voiceAssistantEnabled: boolean;
  // KI & Automation Settings
  aiPersonality: string;
  konsaiMode: string;
  predictionConfidenceThreshold: number;
  signalFilterLevel: string;
  // Security & Privacy
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  dataRetention: number;
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  tradeAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  // Advanced Settings
  apiAccess: boolean;
  webhookUrl: string | null;
  customCss: string | null;
  betaFeatures: boolean;
  developerMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user profile with background updates
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
    retry: 1,
    refetchInterval: 30000, // Background refresh every 30 seconds
    refetchIntervalInBackground: true, // Continue refreshing when tab is not active
    staleTime: 20000, // Data stays fresh for 20 seconds
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    queryFn: async () => {
      const response = await fetch('/api/profile', { 
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Profile API error: ${response.status}`);
      }
      
      return response.json();
    }
  });

  // Fetch user settings with background updates
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    retry: 1,
    refetchInterval: 30000, // Background refresh every 30 seconds
    refetchIntervalInBackground: true, // Continue refreshing when tab is not active
    staleTime: 20000, // Data stays fresh for 20 seconds
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    queryFn: async () => {
      const response = await fetch('/api/settings', { 
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Settings API error: ${response.status}`);
      }
      
      return response.json();
    }
  });

  // Debug logging
  useEffect(() => {
    console.log('Profile data:', profile);
    console.log('Settings data:', settings);
    console.log('Profile loading:', profileLoading);
    console.log('Settings loading:', settingsLoading);
    console.log('Profile error:', profileError);
    console.log('Settings error:', settingsError);
  }, [profile, settings, profileLoading, settingsLoading, profileError, settingsError]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({ title: 'Profile updated successfully' });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: 'Settings updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
    }
  });

  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    updateProfileMutation.mutate({ [field]: value });
  };

  const handleSettingsUpdate = (field: keyof UserSettings, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const themes = [
    { value: 'dark', label: 'Dark Mode', icon: Moon },
    { value: 'light', label: 'Light Mode', icon: Sun },
    { value: 'cosmic', label: 'Cosmic Purple', icon: Sparkles },
    { value: 'konsai', label: 'Konsai Blue', icon: Cpu }
  ];

  const tradingStyles = [
    { value: 'aggressive', label: 'Aggressive', icon: TrendingUp, color: 'text-red-400' },
    { value: 'conservative', label: 'Conservative', icon: Shield, color: 'text-blue-400' },
    { value: 'balanced', label: 'Balanced', icon: Target, color: 'text-green-400' },
    { value: 'ai_driven', label: 'KI Driven', icon: Brain, color: 'text-purple-400' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', icon: Star, progress: 25 },
    { value: 'intermediate', label: 'Intermediate', icon: Trophy, progress: 50 },
    { value: 'advanced', label: 'Advanced', icon: Award, progress: 75 },
    { value: 'expert', label: 'Expert', icon: Crown, progress: 100 }
  ];

  const aiPersonalities = [
    { value: 'spiritual', label: 'Spiritual Sage', icon: Sparkles, description: 'KonsLang wisdom and mystical insights' },
    { value: 'analytical', label: 'Data Analyst', icon: BarChart3, description: 'Pure logic and technical analysis' },
    { value: 'creative', label: 'Creative Genius', icon: Brain, description: 'Innovative strategies and patterns' },
    { value: 'balanced', label: 'Balanced Mind', icon: Target, description: 'Perfect harmony of all approaches' }
  ];

  const achievementIcons = {
    'first_trade': Trophy,
    'profit_master': DollarSign,
    'risk_manager': Shield,
    'streak_king': Zap,
    'ai_trainer': Brain,
    'spiritual_awakened': Sparkles,
    'diamond_hands': Gem,
    'speed_trader': Timer
  };

  // Show content with default values immediately, update in background
  const isInitialLoading = (profileLoading && !profile) || (settingsLoading && !settings);
  
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading profile data...</p>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-800/50 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-slate-800/50 rounded-xl"></div>
              <div className="lg:col-span-2 h-96 bg-slate-800/50 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || settingsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-white">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-400" />
              <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
              <p className="mb-4">There was a problem loading your profile data.</p>
              <div className="text-sm text-left bg-slate-800/50 p-4 rounded-lg">
                {profileError && <div className="mb-2">Profile Error: {profileError.message}</div>}
                {settingsError && <div>Settings Error: {settingsError.message}</div>}
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-purple-500/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 ring-2 ring-purple-400/50">
                  <AvatarImage src={profile?.avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-bold">
                    {profile?.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {profile?.displayName || 'Waides Trader'}
                  </h1>
                  <p className="text-purple-200 text-lg">
                    {profile?.experienceLevel || 'Beginner'} • {profile?.location || 'Global'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {profile?.achievements?.slice(0, 3).map((achievement, index) => {
                      const Icon = achievementIcons[achievement as keyof typeof achievementIcons] || Medal;
                      return (
                        <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-400/30">
                          <Icon className="h-3 w-3 mr-1" />
                          {achievement.replace('_', ' ')}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "secondary"}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-400/30"
                >
                  {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-slate-800/50 border border-purple-500/30">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600/20">
              <User className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-purple-600/20">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600/20">
              <Brain className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">KI</span>
            </TabsTrigger>
            <TabsTrigger value="ui" className="data-[state=active]:bg-purple-600/20">
              <Palette className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">UI/UX</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-600/20">
              <Shield className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600/20">
              <Cpu className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-purple-600/20">
              <Webhook className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600/20">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-400" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Display Name</Label>
                    <Input
                      value={profile?.displayName || ''}
                      onChange={(e) => isEditing && handleProfileUpdate('displayName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200">Bio</Label>
                    <Textarea
                      value={profile?.bio || ''}
                      onChange={(e) => isEditing && handleProfileUpdate('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-purple-200">Location</Label>
                      <Input
                        value={profile?.location || ''}
                        onChange={(e) => isEditing && handleProfileUpdate('location', e.target.value)}
                        disabled={!isEditing}
                        className="bg-slate-700/50 border-purple-400/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-purple-200">Timezone</Label>
                      <Select
                        value={profile?.timezone || 'UTC'}
                        onValueChange={(value) => isEditing && handleProfileUpdate('timezone', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-400/30">
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                          <SelectItem value="JST">Japan Standard Time</SelectItem>
                          <SelectItem value="CEST">Central European Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Profile */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Trading Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Trading Style</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {tradingStyles.map((style) => {
                        const Icon = style.icon;
                        return (
                          <Button
                            key={style.value}
                            variant={profile?.tradingStyle === style.value ? "default" : "outline"}
                            onClick={() => isEditing && handleProfileUpdate('tradingStyle', style.value)}
                            disabled={!isEditing}
                            className={cn(
                              "flex items-center justify-center p-3 h-auto",
                              profile?.tradingStyle === style.value
                                ? "bg-purple-600/30 border-purple-400"
                                : "bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 mr-2", style.color)} />
                            <span className="text-white">{style.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-purple-200">Risk Tolerance: {profile?.riskTolerance || 50}%</Label>
                    <Slider
                      value={[profile?.riskTolerance || 50]}
                      onValueChange={([value]) => isEditing && handleProfileUpdate('riskTolerance', value)}
                      disabled={!isEditing}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-purple-300 mt-1">
                      <span>Conservative</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-purple-200">Experience Level</Label>
                    <div className="space-y-2 mt-2">
                      {experienceLevels.map((level) => {
                        const Icon = level.icon;
                        return (
                          <Button
                            key={level.value}
                            variant={profile?.experienceLevel === level.value ? "default" : "outline"}
                            onClick={() => isEditing && handleProfileUpdate('experienceLevel', level.value)}
                            disabled={!isEditing}
                            className={cn(
                              "w-full flex items-center justify-between p-3 h-auto",
                              profile?.experienceLevel === level.value
                                ? "bg-purple-600/30 border-purple-400"
                                : "bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                            )}
                          >
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-2 text-yellow-400" />
                              <span className="text-white">{level.label}</span>
                            </div>
                            <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                style={{ width: `${level.progress}%` }}
                              />
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements & Stats */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                    Achievements & Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200 mb-2 block">Recent Achievements</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(profile?.achievements || []).map((achievement, index) => {
                        const Icon = achievementIcons[achievement as keyof typeof achievementIcons] || Medal;
                        return (
                          <div
                            key={index}
                            className="flex items-center p-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-400/30"
                          >
                            <Icon className="h-4 w-4 mr-2 text-yellow-400" />
                            <span className="text-white text-xs">
                              {achievement.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-purple-500/30" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Total Trades</span>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-200">
                        {profile?.stats?.totalTrades || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Win Rate</span>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-200">
                        {profile?.stats?.winRate || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Profit Factor</span>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-200">
                        {profile?.stats?.profitFactor || '0.00'}x
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">KonsAi Level</span>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-200">
                        Level {profile?.stats?.konsaiLevel || 1}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Settings Tab */}
          <TabsContent value="trading">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Automation */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-400" />
                    Trading Automation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Auto Trading</Label>
                      <p className="text-sm text-purple-300">Enable autonomous trading</p>
                    </div>
                    <Switch
                      checked={settings?.autoTradingEnabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('autoTradingEnabled', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200">Max Position Size</Label>
                    <Input
                      type="number"
                      value={settings?.maxPositionSize || '1000'}
                      onChange={(e) => handleSettingsUpdate('maxPositionSize', e.target.value)}
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200">Daily Trading Limit</Label>
                    <Input
                      type="number"
                      value={settings?.dailyTradingLimit || '10000'}
                      onChange={(e) => handleSettingsUpdate('dailyTradingLimit', e.target.value)}
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-purple-200">Stop Loss %</Label>
                      <Input
                        type="number"
                        value={settings?.stopLossPercentage || 5}
                        onChange={(e) => handleSettingsUpdate('stopLossPercentage', parseFloat(e.target.value))}
                        className="bg-slate-700/50 border-purple-400/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-purple-200">Take Profit %</Label>
                      <Input
                        type="number"
                        value={settings?.takeProfitPercentage || 10}
                        onChange={(e) => handleSettingsUpdate('takeProfitPercentage', parseFloat(e.target.value))}
                        className="bg-slate-700/50 border-purple-400/30 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart & Analysis */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                    Chart & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Chart Type</Label>
                    <Select
                      value={settings?.chartType || 'candlestick'}
                      onValueChange={(value) => handleSettingsUpdate('chartType', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="heikin_ashi">Heikin Ashi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Default Timeframe</Label>
                    <Select
                      value={settings?.chartTimeframe || '1h'}
                      onValueChange={(value) => handleSettingsUpdate('chartTimeframe', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="1m">1 Minute</SelectItem>
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="15m">15 Minutes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="1d">1 Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Signal Filter Level</Label>
                    <Select
                      value={settings?.signalFilterLevel || 'medium'}
                      onValueChange={(value) => handleSettingsUpdate('signalFilterLevel', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="low">Low (More Signals)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (High Quality Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">
                      Prediction Confidence Threshold: {settings?.predictionConfidenceThreshold || 75}%
                    </Label>
                    <Slider
                      value={[settings?.predictionConfidenceThreshold || 75]}
                      onValueChange={([value]) => handleSettingsUpdate('predictionConfidenceThreshold', value)}
                      min={50}
                      max={95}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* KI & Automation Tab */}
          <TabsContent value="ai">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KI Personality */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-400" />
                    KI Personality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {aiPersonalities.map((personality) => {
                      const Icon = personality.icon;
                      return (
                        <Button
                          key={personality.value}
                          variant={settings?.aiPersonality === personality.value ? "default" : "outline"}
                          onClick={() => handleSettingsUpdate('aiPersonality', personality.value)}
                          className={cn(
                            "w-full flex items-start justify-start p-4 h-auto text-left",
                            settings?.aiPersonality === personality.value
                              ? "bg-purple-600/30 border-purple-400"
                              : "bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                          )}
                        >
                          <Icon className="h-5 w-5 mr-3 mt-0.5 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">{personality.label}</div>
                            <div className="text-sm text-purple-300 mt-1">{personality.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* KonsAi Settings */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-cyan-400" />
                    KonsAi Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">KonsAi Mode</Label>
                    <Select
                      value={settings?.konsaiMode || 'auto'}
                      onValueChange={(value) => handleSettingsUpdate('konsaiMode', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="auto">Auto Mode</SelectItem>
                        <SelectItem value="spiritual">Spiritual Mode</SelectItem>
                        <SelectItem value="oracle">Oracle Mode</SelectItem>
                        <SelectItem value="universal">Universal Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Voice Assistant</Label>
                      <p className="text-sm text-purple-300">Enable voice commands</p>
                    </div>
                    <Switch
                      checked={settings?.voiceAssistantEnabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('voiceAssistantEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Beta Features</Label>
                      <p className="text-sm text-purple-300">Access experimental features</p>
                    </div>
                    <Switch
                      checked={settings?.betaFeatures || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('betaFeatures', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Developer Mode</Label>
                      <p className="text-sm text-purple-300">Advanced debugging tools</p>
                    </div>
                    <Switch
                      checked={settings?.developerMode || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('developerMode', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interface Tab */}
          <TabsContent value="ui">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme & Appearance */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-pink-400" />
                    Theme & Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200 mb-3 block">Theme Selection</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {themes.map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <Button
                            key={theme.value}
                            variant={profile?.theme === theme.value ? "default" : "outline"}
                            onClick={() => handleProfileUpdate('theme', theme.value)}
                            className={cn(
                              "flex items-center justify-center p-4 h-auto",
                              profile?.theme === theme.value
                                ? "bg-purple-600/30 border-purple-400"
                                : "bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                            )}
                          >
                            <Icon className="h-5 w-5 mr-2" />
                            <span className="text-white">{theme.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Animations</Label>
                      <p className="text-sm text-purple-300">Enable UI animations</p>
                    </div>
                    <Switch
                      checked={settings?.animationsEnabled || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('animationsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Sidebar Collapsed</Label>
                      <p className="text-sm text-purple-300">Keep sidebar minimized</p>
                    </div>
                    <Switch
                      checked={settings?.sidebarCollapsed || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('sidebarCollapsed', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audio & Sound */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Volume2 className="h-5 w-5 mr-2 text-green-400" />
                    Audio & Sound
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Sound Effects</Label>
                      <p className="text-sm text-purple-300">Enable UI sound effects</p>
                    </div>
                    <Switch
                      checked={settings?.soundEnabled || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('soundEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Trade Alerts</Label>
                      <p className="text-sm text-purple-300">Audio notifications for trades</p>
                    </div>
                    <Switch
                      checked={settings?.tradeAlerts || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('tradeAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Price Alerts</Label>
                      <p className="text-sm text-purple-300">Audio alerts for price changes</p>
                    </div>
                    <Switch
                      checked={settings?.priceAlerts || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('priceAlerts', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200">Language</Label>
                    <Select
                      value={profile?.language || 'en'}
                      onValueChange={(value) => handleProfileUpdate('language', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Authentication */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-red-400" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Biometric Authentication</Label>
                      <p className="text-sm text-purple-300">Use fingerprint/face ID</p>
                    </div>
                    <Switch
                      checked={settings?.biometricEnabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('biometricEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Two-Factor Authentication</Label>
                      <p className="text-sm text-purple-300">Extra security layer</p>
                    </div>
                    <Switch
                      checked={settings?.twoFactorEnabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('twoFactorEnabled', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200">Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings?.sessionTimeout || 30}
                      onChange={(e) => handleSettingsUpdate('sessionTimeout', parseInt(e.target.value))}
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200">Data Retention (days)</Label>
                    <Input
                      type="number"
                      value={settings?.dataRetention || 365}
                      onChange={(e) => handleSettingsUpdate('dataRetention', parseInt(e.target.value))}
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Notifications */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-yellow-400" />
                    Privacy & Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Email Notifications</Label>
                      <p className="text-sm text-purple-300">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings?.emailNotifications || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">Push Notifications</Label>
                      <p className="text-sm text-purple-300">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings?.pushNotifications || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">News Alerts</Label>
                      <p className="text-sm text-purple-300">Market news notifications</p>
                    </div>
                    <Switch
                      checked={settings?.newsAlerts || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('newsAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-200">API Access</Label>
                      <p className="text-sm text-purple-300">Enable external API access</p>
                    </div>
                    <Switch
                      checked={settings?.apiAccess || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('apiAccess', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200">Webhook URL</Label>
                    <Input
                      value={settings?.webhookUrl || ''}
                      onChange={(e) => handleSettingsUpdate('webhookUrl', e.target.value)}
                      placeholder="https://your-webhook-url.com"
                      className="bg-slate-700/50 border-purple-400/30 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Custom Styling */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Code className="h-5 w-5 mr-2 text-cyan-400" />
                    Custom Styling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Custom CSS</Label>
                    <Textarea
                      value={settings?.customCss || ''}
                      onChange={(e) => handleSettingsUpdate('customCss', e.target.value)}
                      placeholder="/* Your custom CSS here */"
                      className="bg-slate-700/50 border-purple-400/30 text-white font-mono text-sm h-32"
                    />
                    <p className="text-xs text-purple-300 mt-2">
                      Add custom CSS to personalize your interface
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Export & Import */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-400" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full bg-slate-700/50 border-purple-400/30 hover:bg-purple-600/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>

                  <Separator className="bg-purple-500/30" />

                  <Button
                    variant="destructive"
                    className="w-full bg-red-600/20 border-red-400/30 hover:bg-red-600/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Performance */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-green-400" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">CPU Priority</Label>
                    <Select
                      value={settings?.cpuPriority || 'normal'}
                      onValueChange={(value) => handleSettingsUpdate('cpuPriority', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="realtime">Real-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Memory Usage Limit</Label>
                    <Slider
                      value={[settings?.memoryLimit || 4096]}
                      onValueChange={(value) => handleSettingsUpdate('memoryLimit', value[0])}
                      max={16384}
                      min={1024}
                      step={512}
                      className="py-4"
                    />
                    <p className="text-xs text-purple-300">
                      {settings?.memoryLimit || 4096}MB RAM Limit
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200">Update Frequency</Label>
                    <Select
                      value={settings?.updateFrequency || 'standard'}
                      onValueChange={(value) => handleSettingsUpdate('updateFrequency', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="slow">Conservative (5s)</SelectItem>
                        <SelectItem value="standard">Standard (1s)</SelectItem>
                        <SelectItem value="fast">Fast (500ms)</SelectItem>
                        <SelectItem value="turbo">Turbo (100ms)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Hardware Acceleration</Label>
                    <Switch
                      checked={settings?.hardwareAcceleration || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('hardwareAcceleration', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Multi-threading</Label>
                    <Switch
                      checked={settings?.multiThreading || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('multiThreading', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Background Processing</Label>
                    <Switch
                      checked={settings?.backgroundProcessing || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('backgroundProcessing', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Trading Performance */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                    Trading Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Analysis Depth</Label>
                    <Select
                      value={settings?.analysisDepth || 'standard'}
                      onValueChange={(value) => handleSettingsUpdate('analysisDepth', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="basic">Basic Analysis</SelectItem>
                        <SelectItem value="standard">Standard Analysis</SelectItem>
                        <SelectItem value="deep">Deep Analysis</SelectItem>
                        <SelectItem value="konspowa">Kons Powa Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Prediction Accuracy Mode</Label>
                    <Select
                      value={settings?.predictionMode || 'balanced'}
                      onValueChange={(value) => handleSettingsUpdate('predictionMode', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="speed">Speed Priority</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="accuracy">Accuracy Priority</SelectItem>
                        <SelectItem value="conservative">Ultra Conservative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Signal Processing</Label>
                    <Slider
                      value={[settings?.signalProcessing || 75]}
                      onValueChange={(value) => handleSettingsUpdate('signalProcessing', value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="py-4"
                    />
                    <p className="text-xs text-purple-300">
                      {settings?.signalProcessing || 75}% Processing Power
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200">Konsai Network Layers</Label>
                    <Slider
                      value={[settings?.konsaiLayers || 12]}
                      onValueChange={(value) => handleSettingsUpdate('konsaiLayers', value[0])}
                      max={64}
                      min={4}
                      step={4}
                      className="py-4"
                    />
                    <p className="text-xs text-purple-300">
                      {settings?.konsaiLayers || 12} Konsai Layers
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Kons Powa Computing</Label>
                    <Switch
                      checked={settings?.konsPowaComputing || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('konsPowaComputing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Edge Computing</Label>
                    <Switch
                      checked={settings?.edgeComputing || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('edgeComputing', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-400" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Cache Strategy</Label>
                    <Select
                      value={settings?.cacheStrategy || 'intelligent'}
                      onValueChange={(value) => handleSettingsUpdate('cacheStrategy', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="minimal">Minimal Cache</SelectItem>
                        <SelectItem value="intelligent">Intelligent Cache</SelectItem>
                        <SelectItem value="aggressive">Aggressive Cache</SelectItem>
                        <SelectItem value="persistent">Persistent Cache</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-purple-200">Data Compression</Label>
                    <Slider
                      value={[settings?.dataCompression || 70]}
                      onValueChange={(value) => handleSettingsUpdate('dataCompression', value[0])}
                      max={100}
                      min={0}
                      step={10}
                      className="py-4"
                    />
                    <p className="text-xs text-purple-300">
                      {settings?.dataCompression || 70}% Compression Ratio
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200">Backup Frequency</Label>
                    <Select
                      value={settings?.backupFrequency || 'daily'}
                      onValueChange={(value) => handleSettingsUpdate('backupFrequency', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Auto-cleanup</Label>
                    <Switch
                      checked={settings?.autoCleanup || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('autoCleanup', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Data Encryption</Label>
                    <Switch
                      checked={settings?.dataEncryption || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('dataEncryption', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Network Performance */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-cyan-400" />
                    Network Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-purple-200">Connection Pool Size</Label>
                    <Slider
                      value={[settings?.connectionPool || 50]}
                      onValueChange={(value) => handleSettingsUpdate('connectionPool', value[0])}
                      max={200}
                      min={10}
                      step={10}
                      className="py-4"
                    />
                    <p className="text-xs text-purple-300">
                      {settings?.connectionPool || 50} Concurrent Connections
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200">Timeout Settings</Label>
                    <Slider
                      value={[settings?.timeoutSettings || 30]}
                      onValueChange={(value) => handleSettingsUpdate('timeoutSettings', value[0])}
                      max={120}
                      min={5}
                      step={5}
                      className="py-4"
                    />
                    <p className="text-xs text-purple-300">
                      {settings?.timeoutSettings || 30}s Request Timeout
                    </p>
                  </div>

                  <div>
                    <Label className="text-purple-200">Retry Strategy</Label>
                    <Select
                      value={settings?.retryStrategy || 'exponential'}
                      onValueChange={(value) => handleSettingsUpdate('retryStrategy', value)}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-400/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-400/30">
                        <SelectItem value="linear">Linear Backoff</SelectItem>
                        <SelectItem value="exponential">Exponential Backoff</SelectItem>
                        <SelectItem value="fibonacci">Fibonacci Backoff</SelectItem>
                        <SelectItem value="immediate">Immediate Retry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Load Balancing</Label>
                    <Switch
                      checked={settings?.loadBalancing || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('loadBalancing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-purple-200">Auto-failover</Label>
                    <Switch
                      checked={settings?.autoFailover || true}
                      onCheckedChange={(checked) => handleSettingsUpdate('autoFailover', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Platforms */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Trading Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">B</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Binance</p>
                          <p className="text-purple-300 text-sm">Global Exchange</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.binanceIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('binanceIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Coinbase Pro</p>
                          <p className="text-purple-300 text-sm">Advanced Trading</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.coinbaseIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('coinbaseIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">K</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Kraken</p>
                          <p className="text-purple-300 text-sm">Pro Trading</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.krakenIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('krakenIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">B</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Bybit</p>
                          <p className="text-purple-300 text-sm">Derivatives Trading</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.bybitIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('bybitIntegration', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KI & Analytics */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-400" />
                    KI & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Cpu className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">OpenAI GPT-4</p>
                          <p className="text-purple-300 text-sm">Advanced KI Analysis</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.openaiIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('openaiIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">TradingView</p>
                          <p className="text-purple-300 text-sm">Technical Analysis</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.tradingviewIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('tradingviewIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Messari</p>
                          <p className="text-purple-300 text-sm">Market Data</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.messariIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('messariIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">KonsAI Oracle</p>
                          <p className="text-purple-300 text-sm">Spiritual Intelligence</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.konsaiIntegration || true}
                        onCheckedChange={(checked) => handleSettingsUpdate('konsaiIntegration', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication & Alerts */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                    Communication & Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Discord</p>
                          <p className="text-purple-300 text-sm">Trading Alerts</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.discordIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('discordIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Telegram</p>
                          <p className="text-purple-300 text-sm">Instant Notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.telegramIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('telegramIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Email SMTP</p>
                          <p className="text-purple-300 text-sm">Email Notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.emailIntegration || true}
                        onCheckedChange={(checked) => handleSettingsUpdate('emailIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Push Notifications</p>
                          <p className="text-purple-300 text-sm">Mobile Alerts</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.pushIntegration || true}
                        onCheckedChange={(checked) => handleSettingsUpdate('pushIntegration', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Developer Tools */}
              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Code className="h-5 w-5 mr-2 text-emerald-400" />
                    Developer Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                          <Code className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">GitHub</p>
                          <p className="text-purple-300 text-sm">Code Repository</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.githubIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('githubIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                          <Webhook className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Webhooks</p>
                          <p className="text-purple-300 text-sm">Custom Integrations</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.webhooksIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('webhooksIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Database className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">REST API</p>
                          <p className="text-purple-300 text-sm">External Access</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.restApiIntegration || true}
                        onCheckedChange={(checked) => handleSettingsUpdate('restApiIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-400/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">GraphQL</p>
                          <p className="text-purple-300 text-sm">Advanced Queries</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings?.graphqlIntegration || false}
                        onCheckedChange={(checked) => handleSettingsUpdate('graphqlIntegration', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}