import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Shield, Bell, Brain, Zap, Globe, Database } from 'lucide-react';

interface SimpleProfile {
  displayName: string;
  theme: string;
  tradingStyle: string;
  riskTolerance: number;
  experienceLevel: string;
}

interface SimpleSettings {
  autoTradingEnabled: boolean;
  maxPositionSize: string;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  aiPersonality: string;
  predictionConfidenceThreshold: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  tradeAlerts: boolean;
  betaFeatures: boolean;
  developerMode: boolean;
}

export default function SimpleProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const [profile, setProfile] = useState<SimpleProfile>({
    displayName: 'Waides Trader',
    theme: 'dark',
    tradingStyle: 'balanced',
    riskTolerance: 50,
    experienceLevel: 'intermediate'
  });

  const [settings, setSettings] = useState<SimpleSettings>({
    autoTradingEnabled: false,
    maxPositionSize: '1000.00',
    stopLossPercentage: 5,
    takeProfitPercentage: 10,
    aiPersonality: 'balanced',
    predictionConfidenceThreshold: 75,
    emailNotifications: true,
    pushNotifications: true,
    tradeAlerts: true,
    betaFeatures: false,
    developerMode: false
  });

  const handleProfileUpdate = (field: keyof SimpleProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    toast({ title: 'Profile updated successfully' });
  };

  const handleSettingsUpdate = (field: keyof SimpleSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    toast({ title: 'Settings updated successfully' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile & Settings</h1>
          <p className="text-slate-300">Customize your Waides KI experience</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Zap size={16} />
              Trading
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain size={16} />
              AI Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield size={16} />
              Security
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Database size={16} />
              Performance
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe size={16} />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings size={16} />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-slate-300">
                  Customize your personal profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => handleProfileUpdate('displayName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <Select value={profile.theme} onValueChange={(value) => handleProfileUpdate('theme', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="cosmic">Cosmic Purple</SelectItem>
                      <SelectItem value="neural">Neural Blue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Trading Style</Label>
                  <Select value={profile.tradingStyle} onValueChange={(value) => handleProfileUpdate('tradingStyle', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="ai_driven">AI Driven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Risk Tolerance: {profile.riskTolerance}%</Label>
                  <Slider
                    value={[profile.riskTolerance]}
                    onValueChange={(value) => handleProfileUpdate('riskTolerance', value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Experience Level</Label>
                  <Select value={profile.experienceLevel} onValueChange={(value) => handleProfileUpdate('experienceLevel', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Settings</CardTitle>
                <CardDescription className="text-slate-300">
                  Configure your automated trading preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoTrading" className="text-white">Auto Trading Enabled</Label>
                  <Switch
                    id="autoTrading"
                    checked={settings.autoTradingEnabled}
                    onCheckedChange={(checked) => handleSettingsUpdate('autoTradingEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPosition" className="text-white">Max Position Size (USD)</Label>
                  <Input
                    id="maxPosition"
                    value={settings.maxPositionSize}
                    onChange={(e) => handleSettingsUpdate('maxPositionSize', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Stop Loss: {settings.stopLossPercentage}%</Label>
                  <Slider
                    value={[settings.stopLossPercentage]}
                    onValueChange={(value) => handleSettingsUpdate('stopLossPercentage', value[0])}
                    max={20}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Take Profit: {settings.takeProfitPercentage}%</Label>
                  <Slider
                    value={[settings.takeProfitPercentage]}
                    onValueChange={(value) => handleSettingsUpdate('takeProfitPercentage', value[0])}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Configuration</CardTitle>
                <CardDescription className="text-slate-300">
                  Customize AI behavior and prediction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">AI Personality</Label>
                  <Select value={settings.aiPersonality} onValueChange={(value) => handleSettingsUpdate('aiPersonality', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="spiritual">Spiritual Sage</SelectItem>
                      <SelectItem value="analytical">Analytical Expert</SelectItem>
                      <SelectItem value="creative">Creative Innovator</SelectItem>
                      <SelectItem value="balanced">Balanced Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Prediction Confidence Threshold: {settings.predictionConfidenceThreshold}%</Label>
                  <Slider
                    value={[settings.predictionConfidenceThreshold]}
                    onValueChange={(value) => handleSettingsUpdate('predictionConfidenceThreshold', value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-slate-300">
                  Control how you receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-white">Email Notifications</Label>
                  <Switch
                    id="email"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="text-white">Push Notifications</Label>
                  <Switch
                    id="push"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingsUpdate('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="alerts" className="text-white">Trade Alerts</Label>
                  <Switch
                    id="alerts"
                    checked={settings.tradeAlerts}
                    onCheckedChange={(checked) => handleSettingsUpdate('tradeAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Security Features</h3>
                  <p className="text-slate-300">Advanced security features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Optimization</CardTitle>
                <CardDescription className="text-slate-300">
                  Optimize system performance and resource usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Database className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Performance Tools</h3>
                  <p className="text-slate-300">Advanced performance settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Integrations</CardTitle>
                <CardDescription className="text-slate-300">
                  Connect with external platforms and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Globe className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Integrations</h3>
                  <p className="text-slate-300">Platform integrations coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Settings</CardTitle>
                <CardDescription className="text-slate-300">
                  Developer tools and beta features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="beta" className="text-white">Beta Features</Label>
                  <Switch
                    id="beta"
                    checked={settings.betaFeatures}
                    onCheckedChange={(checked) => handleSettingsUpdate('betaFeatures', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dev" className="text-white">Developer Mode</Label>
                  <Switch
                    id="dev"
                    checked={settings.developerMode}
                    onCheckedChange={(checked) => handleSettingsUpdate('developerMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}