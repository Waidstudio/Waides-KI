import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Pickaxe, Cpu, Zap, Brain, Trophy, 
  Wallet, Send, ArrowRightLeft, QrCode,
  Timer, TrendingUp, Star, Gift,
  Play, Square, RefreshCw, Coins
} from 'lucide-react';

interface MiningSession {
  sessionId: string;
  userId: number;
  miningType: 'cpu' | 'gpu' | 'quiz' | 'puzzle';
  difficulty: number;
  isActive: boolean;
  startTime: string;
  duration: number;
  hashRate: number;
  estimatedReward: string;
  smaiOnyixScore: number;
}

interface UserStats {
  totalSmaiSika: number;
  miningEfficiency: number;
  smaiOnyixScore: number;
  totalMiningTime: number;
  achievementsUnlocked: string[];
}

interface Challenge {
  question: string;
  options?: string[];
  correctAnswer?: number;
  answer?: string;
  difficulty: number;
  reward: number;
}

export default function SmaisikaMining() {
  const [activeMiningSession, setActiveMiningSession] = useState<MiningSession | null>(null);
  const [miningType, setMiningType] = useState<'cpu' | 'gpu' | 'quiz' | 'puzzle'>('cpu');
  const [difficulty, setDifficulty] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pinAmount, setPinAmount] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [swapCurrency, setSwapCurrency] = useState('USDT');
  const [walletAddress, setWalletAddress] = useState('');
  const [miningTimer, setMiningTimer] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['/api/smaisika/stats'],
    refetchInterval: 5000
  });

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 3000
  });

  // Fetch exchange rates
  const { data: exchangeRates } = useQuery({
    queryKey: ['/api/smaisika/exchange-rates']
  });

  // Mining mutations
  const startMiningMutation = useMutation({
    mutationFn: async ({ miningType, difficulty }: { miningType: string; difficulty: number }) => {
      const response = await fetch('/api/smaisika/mining/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miningType, difficulty })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Mining Started", description: data.message });
        setActiveMiningSession({ 
          sessionId: data.sessionId, 
          miningType, 
          difficulty,
          isActive: true,
          startTime: new Date().toISOString(),
          duration: 0,
          hashRate: 0,
          estimatedReward: '0',
          smaiOnyixScore: 100,
          userId: 1
        });
        setMiningTimer(0);
      } else {
        toast({ title: "Mining Failed", description: data.message, variant: "destructive" });
      }
    }
  });

  const stopMiningMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch('/api/smaisika/mining/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ 
          title: "Mining Completed", 
          description: `Earned ${data.smaiSikaEarned.toFixed(8)} SmaiSika!`,
          variant: "default"
        });
        setActiveMiningSession(null);
        setMiningTimer(0);
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
        queryClient.invalidateQueries({ queryKey: ['/api/smaisika/stats'] });
      } else {
        toast({ title: "Stop Mining Failed", description: data.message, variant: "destructive" });
      }
    }
  });

  // SmaiPin mutations
  const createPinMutation = useMutation({
    mutationFn: async ({ amount, validityHours, message }: { amount: number; validityHours: number; message: string }) => {
      const response = await fetch('/api/smaisika/pin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, validityHours, message })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "SmaiPin Created", description: `Pin Code: ${data.pinCode}` });
        setPinAmount('');
        setPinMessage('');
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      } else {
        toast({ title: "Pin Creation Failed", description: data.message, variant: "destructive" });
      }
    }
  });

  const redeemPinMutation = useMutation({
    mutationFn: async (pinCode: string) => {
      const response = await fetch('/api/smaisika/pin/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinCode })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "SmaiPin Redeemed", description: `Received ${data.amount} SmaiSika!` });
        setPinCode('');
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      } else {
        toast({ title: "Redemption Failed", description: data.message, variant: "destructive" });
      }
    }
  });

  // Swap mutation
  const swapMutation = useMutation({
    mutationFn: async ({ amount, toCurrency, walletAddress }: { amount: number; toCurrency: string; walletAddress: string }) => {
      const response = await fetch('/api/smaisika/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, toCurrency, walletAddress })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Swap Initiated", description: data.message });
        setSwapAmount('');
        setWalletAddress('');
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      } else {
        toast({ title: "Swap Failed", description: data.message, variant: "destructive" });
      }
    }
  });

  // Mining timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeMiningSession?.isActive) {
      interval = setInterval(() => {
        setMiningTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMiningSession?.isActive]);

  // Fetch mining challenge
  const fetchChallenge = async (type: 'quiz' | 'puzzle') => {
    try {
      const response = await fetch(`/api/smaisika/mining/challenge/${type}?difficulty=${difficulty}`);
      const data = await response.json();
      if (data.success) {
        setCurrentChallenge(data.challenge);
        setChallengeAnswer('');
        setSelectedOption(null);
      }
    } catch (error) {
      toast({ title: "Challenge Failed", description: "Failed to fetch challenge", variant: "destructive" });
    }
  };

  // Submit challenge answer
  const submitAnswer = async () => {
    if (!activeMiningSession || !currentChallenge) return;

    const answer = currentChallenge.options ? selectedOption?.toString() : challengeAnswer;
    
    try {
      const response = await fetch('/api/smaisika/mining/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeMiningSession.sessionId,
          answer
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ 
          title: data.correct ? "Correct!" : "Incorrect", 
          description: data.message,
          variant: data.correct ? "default" : "destructive"
        });
        
        if (miningType === 'quiz' || miningType === 'puzzle') {
          setTimeout(() => fetchChallenge(miningType), 2000);
        }
        
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      }
    } catch (error) {
      toast({ title: "Submission Failed", description: "Failed to submit answer", variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startMining = async () => {
    if (miningType === 'quiz' || miningType === 'puzzle') {
      await fetchChallenge(miningType);
    }
    startMiningMutation.mutate({ miningType, difficulty });
  };

  const stopMining = () => {
    if (activeMiningSession) {
      stopMiningMutation.mutate(activeMiningSession.sessionId);
    }
  };

  const userStats: UserStats = (statsData as any)?.stats || {
    totalSmaiSika: 0,
    miningEfficiency: 1.0,
    smaiOnyixScore: 100,
    totalMiningTime: 0,
    achievementsUnlocked: []
  };

  const currentBalance = (walletData as any)?.smaiBalance || 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Smaisika Mining Portal
        </h1>
        <p className="text-muted-foreground">
          Mine SmaiSika cryptocurrency through computational work and knowledge challenges
        </p>
      </div>

      {/* Balance and Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SmaiSika Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(currentBalance.toString()).toFixed(8)}</div>
            <p className="text-xs text-muted-foreground">SS Tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SmaiOnyix Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.smaiOnyixScore}</div>
            <p className="text-xs text-muted-foreground">Reputation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mining Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.miningEfficiency.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">Multiplier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mining Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(userStats.totalMiningTime / 3600)}h</div>
            <p className="text-xs text-muted-foreground">Hours mined</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mining" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mining" className="flex items-center gap-2">
            <Pickaxe className="h-4 w-4" />
            Mining
          </TabsTrigger>
          <TabsTrigger value="smai-pin" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            SmaiPin
          </TabsTrigger>
          <TabsTrigger value="swap" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Swap
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Mining Tab */}
        <TabsContent value="mining" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mining Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pickaxe className="h-5 w-5" />
                  Mining Control
                </CardTitle>
                <CardDescription>
                  Start mining SmaiSika using different methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mining Type</Label>
                  <Select 
                    value={miningType} 
                    onValueChange={(value: 'cpu' | 'gpu' | 'quiz' | 'puzzle') => setMiningType(value)}
                    disabled={activeMiningSession?.isActive}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          CPU Mining (1x)
                        </div>
                      </SelectItem>
                      <SelectItem value="gpu">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          GPU Mining (2.5x)
                        </div>
                      </SelectItem>
                      <SelectItem value="quiz">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Knowledge Quiz (1.5x)
                        </div>
                      </SelectItem>
                      <SelectItem value="puzzle">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Math Puzzle (2x)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select 
                    value={difficulty.toString()} 
                    onValueChange={(value) => setDifficulty(parseInt(value))}
                    disabled={activeMiningSession?.isActive}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level} ({level * 0.5}x multiplier)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  {!activeMiningSession?.isActive ? (
                    <Button 
                      onClick={startMining} 
                      disabled={startMiningMutation.isPending}
                      className="flex-1"
                    >
                      {startMiningMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Mining
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopMining}
                      variant="destructive"
                      disabled={stopMiningMutation.isPending}
                      className="flex-1"
                    >
                      {stopMiningMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Square className="h-4 w-4 mr-2" />
                      )}
                      Stop Mining
                    </Button>
                  )}
                </div>

                {activeMiningSession?.isActive && (
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mining Time:</span>
                      <Badge variant="outline">{formatTime(miningTimer)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge>{activeMiningSession.miningType.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Difficulty:</span>
                      <Badge variant="secondary">Level {activeMiningSession.difficulty}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Est. Reward:</span>
                      <span className="text-sm font-mono">
                        {(0.001 * miningTimer * difficulty * 1.5).toFixed(8)} SS
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenge Panel */}
            {(miningType === 'quiz' || miningType === 'puzzle') && currentChallenge && activeMiningSession?.isActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {miningType === 'quiz' ? 'Knowledge Quiz' : 'Math Puzzle'}
                  </CardTitle>
                  <CardDescription>
                    Answer correctly to earn bonus SmaiSika
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">{currentChallenge.question}</p>
                  </div>

                  {currentChallenge.options ? (
                    <div className="space-y-2">
                      {currentChallenge.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={selectedOption === index ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedOption(index)}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      value={challengeAnswer}
                      onChange={(e) => setChallengeAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                    />
                  )}

                  <Button 
                    onClick={submitAnswer}
                    disabled={(!challengeAnswer && selectedOption === null)}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Reward: {currentChallenge.reward} SmaiSika
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* SmaiPin Tab */}
        <TabsContent value="smai-pin" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create SmaiPin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Create SmaiPin
                </CardTitle>
                <CardDescription>
                  Send SmaiSika to others using secure pin codes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (SmaiSika)</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={pinAmount}
                    onChange={(e) => setPinAmount(e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message (Optional)</Label>
                  <Textarea
                    value={pinMessage}
                    onChange={(e) => setPinMessage(e.target.value)}
                    placeholder="Add a message for the recipient..."
                  />
                </div>

                <Button 
                  onClick={() => createPinMutation.mutate({
                    amount: parseFloat(pinAmount) || 0,
                    validityHours: 24,
                    message: pinMessage
                  })}
                  disabled={!pinAmount || createPinMutation.isPending}
                  className="w-full"
                >
                  {createPinMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Gift className="h-4 w-4 mr-2" />
                  )}
                  Create SmaiPin
                </Button>
              </CardContent>
            </Card>

            {/* Redeem SmaiPin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Redeem SmaiPin
                </CardTitle>
                <CardDescription>
                  Enter a SmaiPin code to receive SmaiSika
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SmaiPin Code</Label>
                  <Input
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                    placeholder="Enter SmaiPin code..."
                  />
                </div>

                <Button 
                  onClick={() => redeemPinMutation.mutate(pinCode)}
                  disabled={!pinCode || redeemPinMutation.isPending}
                  className="w-full"
                >
                  {redeemPinMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  Redeem SmaiPin
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Swap Tab */}
        <TabsContent value="swap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Swap SmaiSika
              </CardTitle>
              <CardDescription>
                Exchange SmaiSika for real cryptocurrencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (SmaiSika)</Label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Swap To</Label>
                  <Select value={swapCurrency} onValueChange={setSwapCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(exchangeRates as any)?.rates && Object.entries((exchangeRates as any).rates).map(([key, data]: [string, any]) => (
                        <SelectItem key={key} value={key}>
                          {data.name} ({data.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Wallet Address</Label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter destination wallet address..."
                  />
                </div>

                {swapAmount && (exchangeRates as any)?.rates?.[swapCurrency] && (
                  <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Exchange Rate:</span>
                      <span className="font-mono">
                        1 SS = {(exchangeRates as any).rates[swapCurrency].rate} {(exchangeRates as any).rates[swapCurrency].symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>You will receive:</span>
                      <span className="font-mono font-bold">
                        {(parseFloat(swapAmount) * (exchangeRates as any).rates[swapCurrency].rate * 0.99).toFixed(8)} {(exchangeRates as any).rates[swapCurrency].symbol}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      *1% network fee applied
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => swapMutation.mutate({
                    amount: parseFloat(swapAmount) || 0,
                    toCurrency: swapCurrency,
                    walletAddress
                  })}
                  disabled={!swapAmount || !walletAddress || swapMutation.isPending}
                  className="md:col-span-2"
                >
                  {swapMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                  )}
                  Initiate Swap
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mining Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total SmaiSika Earned:</span>
                  <span className="font-mono">{userStats.totalSmaiSika.toFixed(8)} SS</span>
                </div>
                <div className="flex justify-between">
                  <span>Mining Efficiency:</span>
                  <span className="font-mono">{userStats.miningEfficiency.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>SmaiOnyix Score:</span>
                  <span className="font-mono">{userStats.smaiOnyixScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Mining Time:</span>
                  <span className="font-mono">{formatTime(userStats.totalMiningTime)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {userStats.achievementsUnlocked.length > 0 ? (
                  <div className="space-y-2">
                    {userStats.achievementsUnlocked.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No achievements unlocked yet. Start mining to earn achievements!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}