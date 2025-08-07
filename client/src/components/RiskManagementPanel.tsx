import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Calculator, TrendingDown, Eye, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EthicalAssessment {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  marketImpactScore: number;
  ethicalFlags: string[];
  approvalStatus: 'approved' | 'review_required' | 'rejected';
}

interface KellySizing {
  optimalSize: number;
  riskAdjustedSize: number;
  maxRecommendedSize: number;
  confidenceLevel: number;
  warnings: string[];
}

interface WatchdogStats {
  totalPositions: number;
  activeMonitoring: number;
  alertsTriggered: number;
  interventions: number;
  successRate: number;
}

export default function RiskManagementPanel() {
  const [selectedTab, setSelectedTab] = useState('ethical');
  const [assessmentRequest, setAssessmentRequest] = useState({
    decision: 'buy',
    amount: '1000',
    symbol: 'ETH',
    confidence: '0.7'
  });
  const [kellySizingRequest, setKellySizingRequest] = useState({
    winProbability: '0.6',
    winLossRatio: '1.5',
    balance: '10000',
    maxRiskPerTrade: '0.02'
  });
  
  const queryClient = useQueryClient();

  // Fetch watchdog statistics
  const { data: watchdogStats, isLoading: watchdogLoading } = useQuery({
    queryKey: ['/api/risk/positions/watchdog-stats'],
    refetchInterval: 5000,
  });

  // Ethical assessment mutation
  const ethicalAssessment = useMutation({
    mutationFn: async (request: any) => {
      return apiRequest('/api/risk/ethical-assessment', 'POST', {
        decision: {
          action: request.decision,
          symbol: request.symbol,
          amount: parseFloat(request.amount),
          confidence: parseFloat(request.confidence)
        },
        marketContext: {
          volatility: 0.02,
          volume: 1000000,
          trend: 'bullish'
        }
      });
    },
  });

  // Kelly sizing mutation
  const kellySizing = useMutation({
    mutationFn: async (request: any) => {
      return apiRequest('/api/risk/kelly-sizing', 'POST', {
        winProbability: parseFloat(request.winProbability),
        winLossRatio: parseFloat(request.winLossRatio),
        accountBalance: parseFloat(request.balance),
        maxRiskPercentage: parseFloat(request.maxRiskPerTrade)
      });
    },
  });

  const handleEthicalAssessment = () => {
    ethicalAssessment.mutate(assessmentRequest);
  };

  const handleKellySizing = () => {
    kellySizing.mutate(kellySizingRequest);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-green-500" />
        <h2 className="text-2xl font-semibold">Risk Management System</h2>
        <Badge variant="outline" className="text-xs">
          Live Monitoring
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ethical">Ethical Engine</TabsTrigger>
          <TabsTrigger value="kelly">Kelly Sizing</TabsTrigger>
          <TabsTrigger value="watchdog">Position Watchdog</TabsTrigger>
        </TabsList>

        <TabsContent value="ethical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Ethical Assessment Request
                </CardTitle>
                <CardDescription>
                  Submit trading decisions for ethical evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decision">Trading Decision</Label>
                  <Select 
                    value={assessmentRequest.decision}
                    onValueChange={(value) => setAssessmentRequest(prev => ({ ...prev, decision: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={assessmentRequest.symbol}
                    onChange={(e) => setAssessmentRequest(prev => ({ ...prev, symbol: e.target.value }))}
                    placeholder="ETH, BTC, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={assessmentRequest.amount}
                    onChange={(e) => setAssessmentRequest(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence (0-1)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={assessmentRequest.confidence}
                    onChange={(e) => setAssessmentRequest(prev => ({ ...prev, confidence: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleEthicalAssessment}
                  disabled={ethicalAssessment.isPending}
                  className="w-full"
                >
                  {ethicalAssessment.isPending ? 'Assessing...' : 'Run Ethical Assessment'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Assessment Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ethicalAssessment.data?.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Score</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={ethicalAssessment.data.assessment.overallScore} 
                          className="w-20"
                        />
                        <span className="text-sm font-medium">
                          {ethicalAssessment.data.assessment.overallScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Risk Level</span>
                      <Badge variant={
                        ethicalAssessment.data.assessment.riskLevel === 'low' ? 'default' :
                        ethicalAssessment.data.assessment.riskLevel === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {ethicalAssessment.data.assessment.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Badge variant={
                        ethicalAssessment.data.assessment.approvalStatus === 'approved' ? 'default' :
                        ethicalAssessment.data.assessment.approvalStatus === 'review_required' ? 'secondary' : 'destructive'
                      }>
                        {ethicalAssessment.data.assessment.approvalStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {ethicalAssessment.data.assessment.recommendations?.length > 0 && (
                      <div className="space-y-2">
                        <Label>Recommendations</Label>
                        <div className="space-y-1">
                          {ethicalAssessment.data.assessment.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : ethicalAssessment.error ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Assessment failed: {ethicalAssessment.error.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <div>Submit a request to see ethical assessment results</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kelly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  Kelly Sizing Calculator
                </CardTitle>
                <CardDescription>
                  Calculate optimal position sizes using Kelly Criterion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="winProbability">Win Probability (0-1)</Label>
                  <Input
                    id="winProbability"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={kellySizingRequest.winProbability}
                    onChange={(e) => setKellySizingRequest(prev => ({ ...prev, winProbability: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="winLossRatio">Win/Loss Ratio</Label>
                  <Input
                    id="winLossRatio"
                    type="number"
                    step="0.1"
                    min="0"
                    value={kellySizingRequest.winLossRatio}
                    onChange={(e) => setKellySizingRequest(prev => ({ ...prev, winLossRatio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">Account Balance ($)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={kellySizingRequest.balance}
                    onChange={(e) => setKellySizingRequest(prev => ({ ...prev, balance: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRiskPerTrade">Max Risk Per Trade (%)</Label>
                  <Input
                    id="maxRiskPerTrade"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={kellySizingRequest.maxRiskPerTrade}
                    onChange={(e) => setKellySizingRequest(prev => ({ ...prev, maxRiskPerTrade: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleKellySizing}
                  disabled={kellySizing.isPending}
                  className="w-full"
                >
                  {kellySizing.isPending ? 'Calculating...' : 'Calculate Kelly Size'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  Sizing Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kellySizing.data?.success ? (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div className="text-center p-4 bg-muted rounded">
                        <div className="text-2xl font-bold text-green-600">
                          ${kellySizing.data.sizing.optimalSize?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">Optimal Position Size</div>
                      </div>

                      <div className="text-center p-4 bg-muted rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          ${kellySizing.data.sizing.riskAdjustedSize?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">Risk-Adjusted Size</div>
                      </div>

                      <div className="text-center p-4 bg-muted rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          ${kellySizing.data.sizing.maxRecommendedSize?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-muted-foreground">Max Recommended</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Confidence Level</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(kellySizing.data.sizing.confidenceLevel || 0) * 100} 
                          className="w-20"
                        />
                        <span className="text-sm font-medium">
                          {((kellySizing.data.sizing.confidenceLevel || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {kellySizing.data.sizing.warnings?.length > 0 && (
                      <div className="space-y-2">
                        <Label>Warnings</Label>
                        <div className="space-y-1">
                          {kellySizing.data.sizing.warnings.map((warning: string, index: number) => (
                            <Alert key={index} className="border-yellow-200">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <AlertDescription className="text-sm">
                                {warning}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : kellySizing.error ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Calculation failed: {kellySizing.error.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4" />
                    <div>Submit parameters to calculate optimal position sizing</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="watchdog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                Position Watchdog Statistics
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all trading positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {watchdogStats?.success ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">
                      {watchdogStats.stats?.totalPositions || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Positions</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {watchdogStats.stats?.activeMonitoring || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Monitoring</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {watchdogStats.stats?.alertsTriggered || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Alerts Triggered</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {watchdogStats.stats?.interventions || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Interventions</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {watchdogStats.stats?.successRate || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <div className="text-lg font-medium">Watchdog Active</div>
                  <div className="text-sm">Monitoring all positions for risk management</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}