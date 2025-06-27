import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, Shield, Lock, Unlock, Activity, Brain, Heart, TrendingUp, TrendingDown, DollarSign, Zap, Star, Fingerprint } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WalletData {
  balance: number;
  lockedAmount: number;
  available: number;
  tradeEnergy: number;
  karmaScore: number;
  spiritualLevel: number;
  divineApproval: number;
}

interface TradeHistory {
  id: number;
  type: string;
  amount: string;
  symbol: string;
  status: string;
  profit: string;
  createdAt: string;
}

interface BiometricStatus {
  hasSetup: boolean;
  lastAuth: string | null;
  securityLevel: string;
}

const BiometricTradingInterface: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricChallenge, setBiometricChallenge] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wallet data with background updates
  const { data: wallet, isLoading: walletLoading } = useQuery<WalletData>({
    queryKey: ['/api/smai-wallet'],
    refetchInterval: 60000, // Background refresh every 60 seconds
    refetchIntervalInBackground: true, // Continue refreshing when tab is not active
    staleTime: 30000, // Data stays fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    retry: 1
  });

  // Fetch trading history with background updates
  const { data: tradeHistory } = useQuery<{ trades: TradeHistory[] }>({
    queryKey: ['/api/smai-trade/history'],
    refetchInterval: 120000, // Background refresh every 2 minutes
    refetchIntervalInBackground: true, // Continue refreshing when tab is not active
    staleTime: 60000, // Data stays fresh for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    retry: 1
  });

  // Fetch biometric status with background updates
  const { data: biometricStatus } = useQuery<BiometricStatus>({
    queryKey: ['/api/biometric/status'],
    refetchInterval: 300000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true, // Continue refreshing when tab is not active
    staleTime: 240000, // Data stays fresh for 4 minutes
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    retry: 1
  });

  // Lock funds mutation
  const lockFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch('/api/smai-wallet/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (!response.ok) throw new Error('Failed to lock funds');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smai-wallet'] });
      toast({ title: "Funds Locked", description: "Funds secured for moral trading" });
    }
  });

  // Execute trade mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: { amount: number; type: string }) => {
      const response = await fetch('/api/smai-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });
      if (!response.ok) throw new Error('Failed to execute trade');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/smai-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/smai-trade/history'] });
      toast({ 
        title: data.success ? "Trade Successful" : "Trade Failed", 
        description: data.message 
      });
    }
  });

  // Biometric authentication
  const authenticateBiometric = async () => {
    setIsAuthenticating(true);
    try {
      // Generate challenge
      const challengeResponse = await fetch('/api/biometric/challenge');
      const { challenge } = await challengeResponse.json();
      setBiometricChallenge(challenge);

      // Request biometric authentication
      if (navigator.credentials && 'get' in navigator.credentials) {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new TextEncoder().encode(challenge),
            allowCredentials: [],
            timeout: 60000,
            userVerification: 'required'
          }
        });

        if (credential) {
          const authResponse = await fetch('/api/biometric/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential, challenge })
          });

          const result = await authResponse.json();
          if (result.success) {
            toast({ title: "Biometric Authentication", description: "Successfully authenticated" });
            return true;
          }
        }
      }
      
      toast({ title: "Authentication Failed", description: "Biometric verification failed" });
      return false;
    } catch (error) {
      toast({ title: "Authentication Error", description: "Failed to authenticate" });
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLockFunds = async () => {
    if (selectedAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount" });
      return;
    }

    if (!wallet || selectedAmount > wallet.available) {
      toast({ title: "Insufficient Funds", description: "Not enough available balance" });
      return;
    }

    const authenticated = await authenticateBiometric();
    if (authenticated) {
      lockFundsMutation.mutate(selectedAmount);
    }
  };

  const handleExecuteTrade = async (type: string) => {
    if (!wallet || wallet.lockedAmount <= 0) {
      toast({ title: "No Locked Funds", description: "Lock funds first to trade" });
      return;
    }

    const authenticated = await authenticateBiometric();
    if (authenticated) {
      executeTradeMutation.mutate({ amount: wallet.lockedAmount, type });
    }
  };

  // Show content with default values immediately, update in background
  const isInitialLoading = walletLoading && !wallet;
  
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading SmaiSika Moral Trading Platform...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            SmaiSika Moral Trading Platform
          </h1>
          <p className="text-blue-200 text-lg">Self-Driving Biometric Trading with AI Memory Integration</p>
          
          {/* Biometric Status */}
          <div className="flex justify-center items-center space-x-4">
            <Badge variant={biometricStatus?.hasSetup ? "default" : "destructive"} className="px-4 py-2">
              <Fingerprint className="w-4 h-4 mr-2" />
              {biometricStatus?.hasSetup ? "Biometric Enabled" : "Setup Required"}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-blue-200 border-blue-300">
              <Shield className="w-4 h-4 mr-2" />
              Security: {biometricStatus?.securityLevel || 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Wallet Overview */}
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                SmaiSika Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-900/50 p-3 rounded-lg">
                  <div className="text-sm text-purple-300">Total Balance</div>
                  <div className="text-xl font-bold text-white">ꠄ{wallet?.balance.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-blue-900/50 p-3 rounded-lg">
                  <div className="text-sm text-blue-300">Available</div>
                  <div className="text-xl font-bold text-white">ꠄ{wallet?.available.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-orange-900/50 p-3 rounded-lg">
                  <div className="text-sm text-orange-300">Locked</div>
                  <div className="text-xl font-bold text-white">ꠄ{wallet?.lockedAmount.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-green-900/50 p-3 rounded-lg">
                  <div className="text-sm text-green-300">Karma Score</div>
                  <div className="text-xl font-bold text-white">{wallet?.karmaScore || 100}</div>
                </div>
              </div>
              
              {/* Spiritual Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Trade Energy
                  </span>
                  <span className="text-white font-semibold">{wallet?.tradeEnergy || 100}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Spiritual Level
                  </span>
                  <span className="text-white font-semibold">{wallet?.spiritualLevel || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-300 flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    Divine Approval
                  </span>
                  <span className="text-white font-semibold">{wallet?.divineApproval || 75}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Controls */}
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Moral Trading Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Lock Funds Section */}
              <div className="space-y-3">
                <div className="text-sm text-blue-300">Lock Funds for Trading</div>
                <Input
                  type="number"
                  placeholder="Amount to lock"
                  value={selectedAmount || ''}
                  onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
                  className="bg-blue-900/30 border-blue-500/50 text-white"
                />
                <Button 
                  onClick={handleLockFunds}
                  disabled={lockFundsMutation.isPending || selectedAmount <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {lockFundsMutation.isPending ? 'Locking...' : 'Lock Funds'}
                </Button>
              </div>

              {/* Trading Actions */}
              {wallet && wallet.lockedAmount > 0 && (
                <div className="space-y-3 border-t border-purple-500/30 pt-4">
                  <div className="text-sm text-purple-300">Execute Trades</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => handleExecuteTrade('BUY')}
                      disabled={executeTradeMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Buy ETH
                    </Button>
                    <Button 
                      onClick={() => handleExecuteTrade('SELL')}
                      disabled={executeTradeMutation.isPending}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Sell ETH
                    </Button>
                  </div>
                </div>
              )}

              {/* Unlock Funds */}
              {wallet && wallet.lockedAmount > 0 && (
                <Button 
                  onClick={() => {
                    fetch('/api/smai-wallet/unlock', { method: 'POST' })
                      .then(() => queryClient.invalidateQueries({ queryKey: ['/api/smai-wallet'] }));
                  }}
                  variant="outline"
                  className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-900/30"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock All Funds
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI Memory & Status */}
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Memory Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-green-900/50 p-3 rounded-lg">
                  <div className="text-sm text-green-300">Memory Status</div>
                  <div className="text-white font-semibold">Active & Learning</div>
                </div>
                <div className="bg-yellow-900/50 p-3 rounded-lg">
                  <div className="text-sm text-yellow-300">Trading Behavior</div>
                  <div className="text-white font-semibold">Moral & Ethical</div>
                </div>
                <div className="bg-purple-900/50 p-3 rounded-lg">
                  <div className="text-sm text-purple-300">Risk Assessment</div>
                  <div className="text-white font-semibold">Conservative</div>
                </div>
              </div>

              {/* Biometric Security */}
              <div className="border-t border-green-500/30 pt-4">
                <div className="text-sm text-green-300 mb-2">Biometric Security</div>
                <div className="flex items-center justify-between p-2 bg-green-900/30 rounded">
                  <span className="text-white text-sm">Authentication Required</span>
                  <Eye className={`w-5 h-5 ${isAuthenticating ? 'text-yellow-400 animate-pulse' : 'text-green-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading History */}
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-300">Recent Trading History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tradeHistory?.trades?.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={trade.status === 'completed' ? 'default' : 'destructive'}>
                      {trade.type}
                    </Badge>
                    <span className="text-white">₭{parseFloat(trade.amount).toFixed(2)}</span>
                    <span className="text-gray-400">{trade.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${parseFloat(trade.profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(trade.profit) >= 0 ? '+' : ''}₭{parseFloat(trade.profit).toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-400 py-8">
                  No trading history yet. Start your first trade above.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Alert className="bg-blue-900/30 border-blue-500/50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-200">
            SmaiSika Moral Trading Platform is active. All trades require biometric authentication and are monitored by AI memory systems for ethical compliance.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default BiometricTradingInterface;