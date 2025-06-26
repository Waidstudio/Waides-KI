import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Activity, Bot, DollarSign, TrendingUp, Users, Wallet, Play, Square, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AutonomousEngineStatus {
  isRunning: boolean;
  activeUsers: number;
  totalTrades: number;
  totalProfit: number;
  uptime: string;
}

interface UserWalletStats {
  wallet: {
    id: string;
    userId: string;
    walletAddress: string;
    balance: number;
    totalProfit: number;
    totalTrades: number;
    winRate: number;
    activeBot: string;
    botEnabled: boolean;
    riskLevel: string;
  };
  performance: {
    basicBot: {
      totalTrades: number;
      winRate: number;
      profit: number;
    };
    proBot: {
      totalTrades: number;
      winRate: number;
      profit: number;
    };
  };
  recentTrades: Array<{
    id: string;
    botType: string;
    action: string;
    amount: number;
    profit: number;
    timestamp: string;
  }>;
}

interface BotSettings {
  activeBot: string;
  botEnabled: boolean;
  riskLevel: string;
  maxDailyTrades: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
}

export default function AutonomousWealthEngine() {
  const [selectedUserId, setSelectedUserId] = useState('demo-user-001');
  const [botSettings, setBotSettings] = useState<BotSettings>({
    activeBot: 'Waidbot',
    botEnabled: true,
    riskLevel: 'medium',
    maxDailyTrades: 10,
    stopLossPercentage: 5,
    takeProfitPercentage: 10
  });

  const queryClient = useQueryClient();

  // Fetch autonomous engine status
  const { data: engineStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/autonomous/status'],
    refetchInterval: 5000
  });

  // Fetch user wallet stats
  const { data: userStats, isLoading: userLoading } = useQuery({
    queryKey: ['/api/smai-wallet/stats', selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 10000
  });

  // Mutations
  const startEngineMutation = useMutation({
    mutationFn: () => apiRequest('/api/autonomous/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/status'] });
    }
  });

  const stopEngineMutation = useMutation({
    mutationFn: () => apiRequest('/api/autonomous/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/status'] });
    }
  });

  const registerUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('/api/autonomous/register-user', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smai-wallet/stats', selectedUserId] });
    }
  });

  const createWalletMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('/api/smai-wallet/create', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smai-wallet/stats', selectedUserId] });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ userId, settings }: { userId: string; settings: BotSettings }) => 
      apiRequest('/api/autonomous/update-settings', {
        method: 'POST',
        body: JSON.stringify({ userId, settings })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smai-wallet/stats', selectedUserId] });
    }
  });

  const handleStartEngine = () => {
    startEngineMutation.mutate();
  };

  const handleStopEngine = () => {
    stopEngineMutation.mutate();
  };

  const handleRegisterUser = () => {
    registerUserMutation.mutate(selectedUserId);
  };

  const handleCreateWallet = () => {
    createWalletMutation.mutate(selectedUserId);
  };

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate({ userId: selectedUserId, settings: botSettings });
  };

  const status: AutonomousEngineStatus = engineStatus || {
    isRunning: false,
    activeUsers: 0,
    totalTrades: 0,
    totalProfit: 0,
    uptime: '0h 0m'
  };

  const stats: UserWalletStats = userStats || {
    wallet: {
      id: '',
      userId: '',
      walletAddress: '',
      balance: 10000,
      totalProfit: 0,
      totalTrades: 0,
      winRate: 0,
      activeBot: 'Waidbot',
      botEnabled: false,
      riskLevel: 'medium'
    },
    performance: {
      basicBot: { totalTrades: 0, winRate: 0, profit: 0 },
      proBot: { totalTrades: 0, winRate: 0, profit: 0 }
    },
    recentTrades: []
  };

  // Update bot settings when user stats change
  useEffect(() => {
    if (stats.wallet) {
      setBotSettings({
        activeBot: stats.wallet.activeBot || 'Waidbot',
        botEnabled: stats.wallet.botEnabled || false,
        riskLevel: stats.wallet.riskLevel || 'medium',
        maxDailyTrades: 10,
        stopLossPercentage: 5,
        takeProfitPercentage: 10
      });
    }
  }, [stats.wallet]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Autonomous Wealth Engine</h1>
          <p className="text-muted-foreground">24/7 Trading Intelligence - Bots that live forever. Wallets that grow themselves.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={status.isRunning ? "default" : "secondary"}>
            {status.isRunning ? "Running" : "Stopped"}
          </Badge>
          {status.isRunning ? (
            <Button onClick={handleStopEngine} variant="destructive" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Stop Engine
            </Button>
          ) : (
            <Button onClick={handleStartEngine} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start Engine
            </Button>
          )}
        </div>
      </div>

      {/* Engine Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users with active bots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.totalTrades}</div>
            <p className="text-xs text-muted-foreground">Executed across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${status.totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Combined user profits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.uptime}</div>
            <p className="text-xs text-muted-foreground">Engine runtime</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Tabs defaultValue="wallet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallet">Wallet Management</TabsTrigger>
          <TabsTrigger value="settings">Bot Settings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Wallet</CardTitle>
              <CardDescription>Manage user wallets and autonomous trading setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>User ID:</Label>
                <Input
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="max-w-xs"
                />
                <Button onClick={handleCreateWallet} size="sm">
                  <Wallet className="h-4 w-4 mr-2" />
                  Create Wallet
                </Button>
                <Button onClick={handleRegisterUser} size="sm" variant="outline">
                  <Bot className="h-4 w-4 mr-2" />
                  Register for Trading
                </Button>
              </div>

              {stats.wallet.id && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="text-2xl font-bold">${stats.wallet.balance.toFixed(2)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Profit</p>
                          <p className="text-2xl font-bold text-green-600">${stats.wallet.totalProfit.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Win Rate</p>
                          <p className="text-2xl font-bold">{(stats.wallet.winRate * 100).toFixed(1)}%</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {stats.wallet.walletAddress && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{stats.wallet.walletAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Configuration</CardTitle>
              <CardDescription>Configure autonomous trading bot settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Active Bot</Label>
                    <Select value={botSettings.activeBot} onValueChange={(value) => setBotSettings({...botSettings, activeBot: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Waidbot">WaidBot (Long-only ETH)</SelectItem>
                        <SelectItem value="WaidbotPro">WaidBot Pro (Advanced Multi-strategy)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Risk Level</Label>
                    <Select value={botSettings.riskLevel} onValueChange={(value) => setBotSettings({...botSettings, riskLevel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={botSettings.botEnabled}
                      onCheckedChange={(checked) => setBotSettings({...botSettings, botEnabled: checked})}
                    />
                    <Label>Enable Autonomous Trading</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Max Daily Trades</Label>
                    <Input
                      type="number"
                      value={botSettings.maxDailyTrades}
                      onChange={(e) => setBotSettings({...botSettings, maxDailyTrades: parseInt(e.target.value)})}
                      min="1"
                      max="50"
                    />
                  </div>

                  <div>
                    <Label>Stop Loss (%)</Label>
                    <Input
                      type="number"
                      value={botSettings.stopLossPercentage}
                      onChange={(e) => setBotSettings({...botSettings, stopLossPercentage: parseFloat(e.target.value)})}
                      min="0.1"
                      max="20"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label>Take Profit (%)</Label>
                    <Input
                      type="number"
                      value={botSettings.takeProfitPercentage}
                      onChange={(e) => setBotSettings({...botSettings, takeProfitPercentage: parseFloat(e.target.value)})}
                      min="0.1"
                      max="50"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateSettings} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Update Bot Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>WaidBot Performance</CardTitle>
                <CardDescription>Long-only ETH trading bot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Trades:</span>
                    <span className="font-bold">{stats.performance.basicBot.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="font-bold">{(stats.performance.basicBot.winRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit:</span>
                    <span className="font-bold text-green-600">${stats.performance.basicBot.profit.toFixed(2)}</span>
                  </div>
                  <Progress value={stats.performance.basicBot.winRate * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WaidBot Pro Performance</CardTitle>
                <CardDescription>Advanced multi-strategy trading bot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Trades:</span>
                    <span className="font-bold">{stats.performance.proBot.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="font-bold">{(stats.performance.proBot.winRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit:</span>
                    <span className="font-bold text-green-600">${stats.performance.proBot.profit.toFixed(2)}</span>
                  </div>
                  <Progress value={stats.performance.proBot.winRate * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Latest autonomous trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentTrades.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentTrades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.botType === 'Waidbot' ? 'default' : 'secondary'}>
                          {trade.botType}
                        </Badge>
                        <span className="font-medium">{trade.action}</span>
                        <span className="text-sm text-muted-foreground">${trade.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`font-bold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No trades executed yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}