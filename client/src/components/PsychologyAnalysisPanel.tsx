import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, TrendingDown, Activity, AlertTriangle, Smile, Frown } from 'lucide-react';

interface FearGreedData {
  index: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  components: {
    volatility: number;
    volume: number;
    momentum: number;
    marketDominance: number;
  };
  recommendation: string;
  confidence: number;
}

interface MarketSentiment {
  overall: number;
  classification: 'Very Bearish' | 'Bearish' | 'Neutral' | 'Bullish' | 'Very Bullish';
  components: {
    priceAction: number;
    volumeAnalysis: number;
    volatilityAssessment: number;
  };
  signals: {
    buyPressure: number;
    sellPressure: number;
    neutrality: number;
  };
  confidence: number;
}

interface PsychologyStats {
  totalAnalyses: number;
  averageFearGreed: number;
  averageSentiment: number;
  mostFrequentEmotion: string;
  accuracyRate: number;
}

export default function PsychologyAnalysisPanel() {
  const [selectedTab, setSelectedTab] = useState('fear-greed');
  const [marketParams, setMarketParams] = useState({
    volatility: '0.025',
    volume: '150000',
    price: '3200',
    momentum: '0.15'
  });

  // Fetch Fear & Greed Index
  const { data: fearGreedData, isLoading: fearGreedLoading, refetch: refetchFearGreed } = useQuery({
    queryKey: ['/api/psychology/fear-greed', marketParams],
    queryFn: () => fetch(`/api/psychology/fear-greed?${new URLSearchParams(marketParams)}`).then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch Market Sentiment
  const { data: sentimentData, isLoading: sentimentLoading, refetch: refetchSentiment } = useQuery({
    queryKey: ['/api/psychology/market-sentiment', marketParams],
    queryFn: () => fetch(`/api/psychology/market-sentiment?${new URLSearchParams(marketParams)}`).then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch Psychology Statistics
  const { data: psychologyStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/psychology/stats'],
    refetchInterval: 60000,
  });

  const handleRefreshAnalysis = () => {
    refetchFearGreed();
    refetchSentiment();
  };

  const getFearGreedColor = (index: number) => {
    if (index <= 20) return 'text-red-600';
    if (index <= 40) return 'text-orange-600';
    if (index <= 60) return 'text-yellow-600';
    if (index <= 80) return 'text-green-600';
    return 'text-green-800';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment <= 20) return 'text-red-600';
    if (sentiment <= 40) return 'text-orange-600';
    if (sentiment <= 60) return 'text-yellow-600';
    if (sentiment <= 80) return 'text-green-600';
    return 'text-green-800';
  };

  const getSentimentIcon = (classification: string) => {
    if (classification.includes('Bearish')) return <TrendingDown className="h-5 w-5 text-red-500" />;
    if (classification.includes('Bullish')) return <TrendingUp className="h-5 w-5 text-green-500" />;
    return <Activity className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Market Psychology Analysis</h2>
        <Badge variant="outline" className="text-xs">
          AI-Powered
        </Badge>
      </div>

      {/* Market Parameters Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Market Parameters
          </CardTitle>
          <CardDescription>
            Adjust market conditions for psychology analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="volatility">Volatility</Label>
              <Input
                id="volatility"
                type="number"
                step="0.001"
                value={marketParams.volatility}
                onChange={(e) => setMarketParams(prev => ({ ...prev, volatility: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                type="number"
                value={marketParams.volume}
                onChange={(e) => setMarketParams(prev => ({ ...prev, volume: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={marketParams.price}
                onChange={(e) => setMarketParams(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="momentum">Momentum</Label>
              <Input
                id="momentum"
                type="number"
                step="0.01"
                value={marketParams.momentum}
                onChange={(e) => setMarketParams(prev => ({ ...prev, momentum: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleRefreshAnalysis} className="w-full">
              Update Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fear-greed">Fear & Greed</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="fear-greed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {fearGreedData?.success && fearGreedData.fearGreed.index <= 50 ? 
                    <Frown className="h-5 w-5 text-red-500" /> : 
                    <Smile className="h-5 w-5 text-green-500" />
                  }
                  Fear & Greed Index
                </CardTitle>
                <CardDescription>
                  Real-time market emotion analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fearGreedData?.success ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getFearGreedColor(fearGreedData.fearGreed.index)}`}>
                        {fearGreedData.fearGreed.index}
                      </div>
                      <div className="text-lg font-medium mt-2">
                        {fearGreedData.fearGreed.classification}
                      </div>
                      <Progress 
                        value={fearGreedData.fearGreed.index} 
                        className="mt-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Confidence</span>
                        <span className="font-medium">{(fearGreedData.fearGreed.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={fearGreedData.fearGreed.confidence * 100} />
                    </div>

                    <div className="p-3 bg-muted rounded text-sm">
                      <strong>Recommendation:</strong> {fearGreedData.fearGreed.recommendation}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {fearGreedLoading ? 'Loading...' : 'No data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fear & Greed Components</CardTitle>
                <CardDescription>
                  Breakdown of psychological indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fearGreedData?.success ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Volatility Impact</span>
                        <div className="flex items-center gap-2">
                          <Progress value={fearGreedData.fearGreed.components.volatility} className="w-24" />
                          <span className="text-sm w-12">{fearGreedData.fearGreed.components.volatility}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Volume Impact</span>
                        <div className="flex items-center gap-2">
                          <Progress value={fearGreedData.fearGreed.components.volume} className="w-24" />
                          <span className="text-sm w-12">{fearGreedData.fearGreed.components.volume}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Momentum</span>
                        <div className="flex items-center gap-2">
                          <Progress value={fearGreedData.fearGreed.components.momentum} className="w-24" />
                          <span className="text-sm w-12">{fearGreedData.fearGreed.components.momentum}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Market Dominance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={fearGreedData.fearGreed.components.marketDominance} className="w-24" />
                          <span className="text-sm w-12">{fearGreedData.fearGreed.components.marketDominance}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Component analysis will appear here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {sentimentData?.success && getSentimentIcon(sentimentData.sentiment.classification)}
                  Market Sentiment
                </CardTitle>
                <CardDescription>
                  AI-driven sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentimentData?.success ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getSentimentColor(sentimentData.sentiment.overall)}`}>
                        {sentimentData.sentiment.overall}
                      </div>
                      <div className="text-lg font-medium mt-2">
                        {sentimentData.sentiment.classification}
                      </div>
                      <Progress 
                        value={sentimentData.sentiment.overall} 
                        className="mt-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Confidence</span>
                        <span className="font-medium">{(sentimentData.sentiment.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={sentimentData.sentiment.confidence * 100} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-bold text-red-600">{sentimentData.sentiment.signals.sellPressure}%</div>
                        <div className="text-red-500">Sell Pressure</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-bold text-yellow-600">{sentimentData.sentiment.signals.neutrality}%</div>
                        <div className="text-yellow-500">Neutral</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-600">{sentimentData.sentiment.signals.buyPressure}%</div>
                        <div className="text-green-500">Buy Pressure</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {sentimentLoading ? 'Loading...' : 'No data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Components</CardTitle>
                <CardDescription>
                  Detailed sentiment breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentimentData?.success ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Price Action</span>
                        <div className="flex items-center gap-2">
                          <Progress value={sentimentData.sentiment.components.priceAction} className="w-24" />
                          <span className="text-sm w-12">{sentimentData.sentiment.components.priceAction}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Volume Analysis</span>
                        <div className="flex items-center gap-2">
                          <Progress value={sentimentData.sentiment.components.volumeAnalysis} className="w-24" />
                          <span className="text-sm w-12">{sentimentData.sentiment.components.volumeAnalysis}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Volatility Assessment</span>
                        <div className="flex items-center gap-2">
                          <Progress value={sentimentData.sentiment.components.volatilityAssessment} className="w-24" />
                          <span className="text-sm w-12">{sentimentData.sentiment.components.volatilityAssessment}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Sentiment components will appear here
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
                <Brain className="h-5 w-5 text-purple-500" />
                Psychology Analysis Statistics
              </CardTitle>
              <CardDescription>
                Historical performance and accuracy metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {psychologyStats?.success ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">
                      {psychologyStats.stats?.totalAnalyses || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Analyses</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {psychologyStats.stats?.averageFearGreed || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Fear/Greed</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {psychologyStats.stats?.averageSentiment || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Sentiment</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {psychologyStats.stats?.accuracyRate || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {psychologyStats.stats?.mostFrequentEmotion || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Most Frequent</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <div className="text-lg font-medium">Statistics Loading</div>
                  <div className="text-sm">Historical psychology data analysis</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}