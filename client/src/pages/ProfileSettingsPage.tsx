import { useState } from 'react';
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
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const ProfileSettingsPage = () => {
  const { toast } = useToast();
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <Bot className="w-4 h-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

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
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
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