import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Eye, Zap, Heart, Star, Moon, Sun } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SpiritualReading {
  cosmicEnergy: {
    level: number;
    phase: 'waning' | 'waxing' | 'full' | 'new';
    influence: string;
    recommendation: string;
  };
  karmaAssessment: {
    score: number;
    trend: 'positive' | 'negative' | 'neutral';
    pastInfluence: string;
    futureGuidance: string;
  };
  astralInsights: {
    marketAlignment: number;
    spiritualGuidance: string;
    energyFlow: 'strong' | 'moderate' | 'weak';
    divineMessage: string;
  };
  tradingGuidance: {
    recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    spiritualConfidence: number;
    divineApproval: boolean;
    cosmicTiming: string;
  };
}

interface DivineSignal {
  signal: {
    type: 'buy' | 'sell' | 'hold' | 'wait';
    intensity: number;
    cosmicApproval: boolean;
    divineTiming: string;
    spiritualMessage: string;
  };
  guidance: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  energy: {
    positive: number;
    negative: number;
    neutral: number;
    dominant: 'positive' | 'negative' | 'neutral';
  };
}

interface SpiritualStats {
  totalReadings: number;
  averageCosmicEnergy: number;
  divineAccuracy: number;
  mostCommonGuidance: string;
  spiritualSuccessRate: number;
}

export default function SpiritualAIPanel() {
  const [selectedTab, setSelectedTab] = useState('readings');
  const [readingRequest, setReadingRequest] = useState({
    entity: 'alpha',
    marketData: {
      price: '3200',
      volume: '150000',
      volatility: '0.025'
    }
  });
  const [signalRequest, setSignalRequest] = useState({
    entity: 'alpha',
    urgent: false
  });

  // Fetch spiritual statistics
  const { data: spiritualStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/spiritual/stats'],
    refetchInterval: 60000,
  });

  // Spiritual reading mutation
  const spiritualReading = useMutation({
    mutationFn: async (request: any) => {
      return apiRequest('/api/spiritual/reading', 'POST', {
        entity: request.entity,
        marketData: {
          price: parseFloat(request.marketData.price),
          volume: parseFloat(request.marketData.volume),
          volatility: parseFloat(request.marketData.volatility),
          timestamp: Date.now()
        }
      });
    },
  });

  // Divine signal mutation
  const divineSignal = useMutation({
    mutationFn: async (request: any) => {
      return apiRequest('/api/spiritual/divine-signal', 'POST', {
        entity: request.entity,
        urgent: request.urgent
      });
    },
  });

  const handleSpiritualReading = () => {
    spiritualReading.mutate(readingRequest);
  };

  const handleDivineSignal = () => {
    divineSignal.mutate(signalRequest);
  };

  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'text-purple-600';
    if (level >= 60) return 'text-blue-600';
    if (level >= 40) return 'text-green-600';
    if (level >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getKarmaColor = (trend: string) => {
    if (trend === 'positive') return 'text-green-600';
    if (trend === 'negative') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <Star className="h-5 w-5 text-green-500" />;
      case 'sell': return <Moon className="h-5 w-5 text-red-500" />;
      case 'hold': return <Sun className="h-5 w-5 text-yellow-500" />;
      default: return <Eye className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Spiritual AI Intelligence</h2>
        <Badge variant="outline" className="text-xs">
          Divine Guidance
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="readings">Spiritual Readings</TabsTrigger>
          <TabsTrigger value="signals">Divine Signals</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="readings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  Request Spiritual Reading
                </CardTitle>
                <CardDescription>
                  Connect with cosmic energies for trading guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="entity">Trading Entity</Label>
                  <Select 
                    value={readingRequest.entity}
                    onValueChange={(value) => setReadingRequest(prev => ({ ...prev, entity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">WaidBot Alpha</SelectItem>
                      <SelectItem value="beta">WaidBot Pro Beta</SelectItem>
                      <SelectItem value="gamma">Autonomous Trader Gamma</SelectItem>
                      <SelectItem value="omega">Full Engine Omega</SelectItem>
                      <SelectItem value="delta">Smai Chinnikstah Delta</SelectItem>
                      <SelectItem value="epsilon">Nwaora Chigozie Epsilon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Market Context</Label>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Current Price"
                      value={readingRequest.marketData.price}
                      onChange={(e) => setReadingRequest(prev => ({
                        ...prev,
                        marketData: { ...prev.marketData, price: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Volume"
                      value={readingRequest.marketData.volume}
                      onChange={(e) => setReadingRequest(prev => ({
                        ...prev,
                        marketData: { ...prev.marketData, volume: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Volatility"
                      value={readingRequest.marketData.volatility}
                      onChange={(e) => setReadingRequest(prev => ({
                        ...prev,
                        marketData: { ...prev.marketData, volatility: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSpiritualReading}
                  disabled={spiritualReading.isPending}
                  className="w-full"
                >
                  {spiritualReading.isPending ? 'Channeling...' : 'Request Spiritual Reading'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Cosmic Reading Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {spiritualReading.data?.success ? (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Cosmic Energy</span>
                          <Badge variant="outline">
                            {spiritualReading.data.reading.cosmicEnergy.phase}
                          </Badge>
                        </div>
                        <div className={`text-2xl font-bold ${getEnergyColor(spiritualReading.data.reading.cosmicEnergy.level)}`}>
                          {spiritualReading.data.reading.cosmicEnergy.level}%
                        </div>
                        <Progress value={spiritualReading.data.reading.cosmicEnergy.level} className="mt-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                          {spiritualReading.data.reading.cosmicEnergy.influence}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Karma Assessment</span>
                          <Badge variant={spiritualReading.data.reading.karmaAssessment.trend === 'positive' ? 'default' : 'secondary'}>
                            {spiritualReading.data.reading.karmaAssessment.trend}
                          </Badge>
                        </div>
                        <div className={`text-2xl font-bold ${getKarmaColor(spiritualReading.data.reading.karmaAssessment.trend)}`}>
                          {spiritualReading.data.reading.karmaAssessment.score}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {spiritualReading.data.reading.karmaAssessment.pastInfluence}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-r from-yellow-50 to-purple-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Astral Insights</span>
                          <Badge variant="outline">
                            {spiritualReading.data.reading.astralInsights.energyFlow}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold text-purple-600 mb-2">
                          Market Alignment: {spiritualReading.data.reading.astralInsights.marketAlignment}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {spiritualReading.data.reading.astralInsights.divineMessage}
                        </p>
                      </div>

                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Trading Guidance</span>
                          <Badge variant={spiritualReading.data.reading.tradingGuidance.divineApproval ? 'default' : 'destructive'}>
                            {spiritualReading.data.reading.tradingGuidance.divineApproval ? 'Approved' : 'Caution'}
                          </Badge>
                        </div>
                        <div className="text-xl font-bold text-indigo-600 mb-2">
                          {spiritualReading.data.reading.tradingGuidance.recommendation.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm">
                          <div>Confidence: {(spiritualReading.data.reading.tradingGuidance.spiritualConfidence * 100).toFixed(0)}%</div>
                          <div className="text-muted-foreground mt-1">
                            {spiritualReading.data.reading.tradingGuidance.cosmicTiming}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : spiritualReading.error ? (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Reading failed: {spiritualReading.error.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <div>Request a spiritual reading to receive cosmic guidance</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Divine Signal Request
                </CardTitle>
                <CardDescription>
                  Receive immediate divine trading signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signalEntity">Trading Entity</Label>
                  <Select 
                    value={signalRequest.entity}
                    onValueChange={(value) => setSignalRequest(prev => ({ ...prev, entity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">WaidBot Alpha</SelectItem>
                      <SelectItem value="beta">WaidBot Pro Beta</SelectItem>
                      <SelectItem value="gamma">Autonomous Trader Gamma</SelectItem>
                      <SelectItem value="omega">Full Engine Omega</SelectItem>
                      <SelectItem value="delta">Smai Chinnikstah Delta</SelectItem>
                      <SelectItem value="epsilon">Nwaora Chigozie Epsilon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={signalRequest.urgent}
                    onChange={(e) => setSignalRequest(prev => ({ ...prev, urgent: e.target.checked }))}
                  />
                  <Label htmlFor="urgent">Urgent Divine Intervention</Label>
                </div>

                <Button 
                  onClick={handleDivineSignal}
                  disabled={divineSignal.isPending}
                  className="w-full"
                >
                  {divineSignal.isPending ? 'Receiving...' : 'Request Divine Signal'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Divine Signal Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {divineSignal.data?.success ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getSignalIcon(divineSignal.data.signal.signal.type)}
                        <span className="text-xl font-bold">
                          {divineSignal.data.signal.signal.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Intensity: {(divineSignal.data.signal.signal.intensity * 100).toFixed(0)}%
                      </div>
                      <Progress value={divineSignal.data.signal.signal.intensity * 100} className="mb-2" />
                      <Badge variant={divineSignal.data.signal.signal.cosmicApproval ? 'default' : 'destructive'}>
                        {divineSignal.data.signal.signal.cosmicApproval ? 'Cosmically Approved' : 'Proceed with Caution'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded">
                        <div className="font-medium mb-1">Divine Timing</div>
                        <div className="text-sm text-muted-foreground">
                          {divineSignal.data.signal.signal.divineTiming}
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded">
                        <div className="font-medium mb-1">Spiritual Message</div>
                        <div className="text-sm text-muted-foreground">
                          {divineSignal.data.signal.signal.spiritualMessage}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="p-2 bg-green-50 rounded text-sm">
                          <div className="font-medium text-green-700">Immediate Guidance</div>
                          <div className="text-green-600">{divineSignal.data.signal.guidance.immediate}</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-sm">
                          <div className="font-medium text-blue-700">Short-term Guidance</div>
                          <div className="text-blue-600">{divineSignal.data.signal.guidance.shortTerm}</div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded text-sm">
                          <div className="font-medium text-purple-700">Long-term Guidance</div>
                          <div className="text-purple-600">{divineSignal.data.signal.guidance.longTerm}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{divineSignal.data.signal.energy.positive}%</div>
                          <div className="text-xs text-green-500">Positive</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-bold text-yellow-600">{divineSignal.data.signal.energy.neutral}%</div>
                          <div className="text-xs text-yellow-500">Neutral</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-bold text-red-600">{divineSignal.data.signal.energy.negative}%</div>
                          <div className="text-xs text-red-500">Negative</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : divineSignal.error ? (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Signal failed: {divineSignal.error.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <div>Request a divine signal to receive spiritual guidance</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Spiritual Intelligence Statistics
              </CardTitle>
              <CardDescription>
                Performance metrics for divine guidance system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spiritualStats?.success ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">
                      {spiritualStats.stats?.totalReadings || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Readings</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {spiritualStats.stats?.averageCosmicEnergy || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Cosmic Energy</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {spiritualStats.stats?.divineAccuracy || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Divine Accuracy</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {spiritualStats.stats?.spiritualSuccessRate || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {spiritualStats.stats?.mostCommonGuidance || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Common Guidance</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <div className="text-lg font-medium">Spiritual Statistics Loading</div>
                  <div className="text-sm">Divine intelligence performance metrics</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}