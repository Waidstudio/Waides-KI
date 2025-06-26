import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { Activity, Brain, Network, BarChart3, Users, Zap, Eye, Waves, Sparkles } from 'lucide-react';

interface OrderBookPresence {
  pressure: string;
  strength: number;
  confidence: number;
  description: string;
}

interface ConsensusData {
  consensus_pressure: string;
  confidence: number;
  participating_nodes: any[];
  interpretation: string;
  should_trade: boolean;
}

interface SentimentData {
  overall_sentiment: string;
  score: number;
  confidence: number;
  trading_signal: string;
}

interface PresenceEvaluation {
  overall_alignment: string;
  alignment_score: number;
  recommendation: string;
  risk_level: string;
}

interface CollectiveConsciousness {
  network_harmony: number;
  consciousness_level: string;
  active_entanglements: number;
  mesh_health: string;
}

interface CollectiveDecision {
  proposed_action: string;
  execution_confidence: number;
  should_execute: boolean;
  collective_support: string;
}

interface FullSentienceAnalysis {
  timestamp: number;
  order_book_presence: {
    local_pressure: string;
    strength: number;
    confidence: number;
  };
  network_consensus: {
    consensus_pressure: string;
    confidence: number;
    participating_nodes: number;
    should_trade: boolean;
  };
  market_sentiment: {
    overall_sentiment: string;
    score: number;
    confidence: number;
    trading_signal: string;
  };
  presence_orchestration: {
    overall_alignment: string;
    alignment_score: number;
    recommendation: string;
    risk_level: string;
  };
  collective_consciousness: {
    network_harmony: number;
    consciousness_level: string;
    active_entanglements: number;
    mesh_health: string;
  };
  collective_decision: {
    proposed_action: string;
    execution_confidence: number;
    should_execute: boolean;
    collective_support: string;
  };
  unified_recommendation: {
    action: string;
    confidence: number;
    reasoning: string;
    risk_assessment: string;
    systems_aligned: number;
  };
}

export function ETHOrderBookSentience() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Fetch comprehensive sentience analysis
  const { data: sentienceAnalysis, isLoading: isAnalysisLoading, error: analysisError } = useQuery({
    queryKey: ['/api/advanced_sentience/full_analysis', refreshKey],
    refetchInterval: isAutoRefresh ? 10000 : false,
  });

  // Fetch multi-node consensus data
  const { data: consensusData, isLoading: isConsensusLoading } = useQuery({
    queryKey: ['/api/multi_node_consensus/status', refreshKey],
    refetchInterval: isAutoRefresh ? 15000 : false,
  });

  // Fetch sentiment data
  const { data: sentimentData, isLoading: isSentimentLoading } = useQuery({
    queryKey: ['/api/eth_sentiment/current', refreshKey],
    refetchInterval: isAutoRefresh ? 12000 : false,
  });

  // Fetch entangled mesh data
  const { data: meshData, isLoading: isMeshLoading } = useQuery({
    queryKey: ['/api/entangled_mesh/collective_consciousness', refreshKey],
    refetchInterval: isAutoRefresh ? 8000 : false,
  });

  // Fetch collective conductor data
  const { data: conductorData, isLoading: isConductorLoading } = useQuery({
    queryKey: ['/api/collective_conductor/current_proposal', refreshKey],
    refetchInterval: isAutoRefresh ? 6000 : false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoRefresh) {
        setRefreshKey(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const getPressureColor = (pressure: string) => {
    switch (pressure?.toLowerCase()) {
      case 'strong_bullish': return 'text-emerald-400';
      case 'moderate_bullish': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'moderate_bearish': return 'text-orange-400';
      case 'strong_bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish': return 'text-emerald-400';
      case 'neutral': return 'text-yellow-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment?.toLowerCase()) {
      case 'strong_bullish': return 'text-emerald-400';
      case 'moderate_bullish': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'moderate_bearish': return 'text-orange-400';
      case 'strong_bearish': return 'text-red-400';
      case 'conflicted': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'buy_eth': return 'text-emerald-400';
      case 'sell_eth': return 'text-red-400';
      case 'hold': return 'text-yellow-400';
      case 'wait': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const analysis = sentienceAnalysis as FullSentienceAnalysis;

  if (analysisError) {
    return (
      <Card className="w-full bg-red-950/20 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400">Advanced Sentience Analysis Error</CardTitle>
          <CardDescription className="text-red-300">
            Failed to load multi-node sentience data. System may be initializing.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Advanced Multi-Node Sentience & Order Flow Sync
          </h2>
          <p className="text-gray-400">
            STEP 57: Entangled Presence Mesh Collective Trade Humanization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Manual Refresh
          </Button>
        </div>
      </div>

      {isAnalysisLoading ? (
        <Card className="w-full bg-slate-900/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-blue-400">Initializing multi-node sentience analysis...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Unified Recommendation Banner */}
          {analysis?.unified_recommendation && (
            <Card className="w-full bg-gradient-to-r from-blue-950/30 to-purple-950/30 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">Unified AI Recommendation</h3>
                      <Badge className={`${getActionColor(analysis.unified_recommendation.action)} bg-transparent border-current`}>
                        {analysis.unified_recommendation.action}
                      </Badge>
                    </div>
                    <p className="text-gray-300 max-w-3xl">
                      {analysis.unified_recommendation.reasoning}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {analysis.unified_recommendation.confidence}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {analysis.unified_recommendation.systems_aligned}/4 Systems Aligned
                    </div>
                    <Badge variant={analysis.unified_recommendation.risk_assessment === 'low' ? 'default' : 'destructive'}>
                      {analysis.unified_recommendation.risk_assessment} risk
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-600">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="consensus" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Network Consensus
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Market Sentiment
              </TabsTrigger>
              <TabsTrigger value="orchestrator" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Presence Orchestrator
              </TabsTrigger>
              <TabsTrigger value="mesh" className="flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Entangled Mesh
              </TabsTrigger>
              <TabsTrigger value="conductor" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collective Conductor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Order Book Presence */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      Order Book Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Local Pressure:</span>
                      <Badge className={`${getPressureColor(analysis?.order_book_presence?.local_pressure)} bg-transparent border-current`}>
                        {analysis?.order_book_presence?.local_pressure || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Strength:</span>
                        <span className="text-white">{analysis?.order_book_presence?.strength || 0}%</span>
                      </div>
                      <Progress value={analysis?.order_book_presence?.strength || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{analysis?.order_book_presence?.confidence || 0}%</span>
                      </div>
                      <Progress value={analysis?.order_book_presence?.confidence || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Network Consensus */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Network className="h-5 w-5 text-green-400" />
                      Network Consensus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Consensus:</span>
                      <Badge className={`${getPressureColor(analysis?.network_consensus?.consensus_pressure)} bg-transparent border-current`}>
                        {analysis?.network_consensus?.consensus_pressure || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{analysis?.network_consensus?.confidence || 0}%</span>
                      </div>
                      <Progress value={analysis?.network_consensus?.confidence || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nodes:</span>
                      <span className="text-white">{analysis?.network_consensus?.participating_nodes || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Should Trade:</span>
                      <Badge variant={analysis?.network_consensus?.should_trade ? 'default' : 'secondary'}>
                        {analysis?.network_consensus?.should_trade ? 'YES' : 'NO'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Sentiment */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      Market Sentiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Sentiment:</span>
                      <Badge className={`${getSentimentColor(analysis?.market_sentiment?.overall_sentiment)} bg-transparent border-current`}>
                        {analysis?.market_sentiment?.overall_sentiment || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Score:</span>
                        <span className="text-white">{analysis?.market_sentiment?.score || 0}</span>
                      </div>
                      <Progress 
                        value={Math.abs(analysis?.market_sentiment?.score || 0)} 
                        className="h-2" 
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{analysis?.market_sentiment?.confidence || 0}%</span>
                      </div>
                      <Progress value={analysis?.market_sentiment?.confidence || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Signal:</span>
                      <span className="text-white text-sm">{analysis?.market_sentiment?.trading_signal || 'None'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Presence Orchestration */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-400" />
                      Presence Orchestration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Alignment:</span>
                      <Badge className={`${getAlignmentColor(analysis?.presence_orchestration?.overall_alignment)} bg-transparent border-current`}>
                        {analysis?.presence_orchestration?.overall_alignment || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Score:</span>
                        <span className="text-white">{analysis?.presence_orchestration?.alignment_score || 0}</span>
                      </div>
                      <Progress 
                        value={Math.abs(analysis?.presence_orchestration?.alignment_score || 0)} 
                        className="h-2" 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Risk Level:</span>
                      <Badge variant={analysis?.presence_orchestration?.risk_level === 'low' ? 'default' : 'destructive'}>
                        {analysis?.presence_orchestration?.risk_level || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {analysis?.presence_orchestration?.recommendation || 'No recommendation'}
                    </div>
                  </CardContent>
                </Card>

                {/* Collective Consciousness */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Waves className="h-5 w-5 text-cyan-400" />
                      Collective Consciousness
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Network Harmony:</span>
                        <span className="text-white">{analysis?.collective_consciousness?.network_harmony || 0}%</span>
                      </div>
                      <Progress value={analysis?.collective_consciousness?.network_harmony || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Level:</span>
                      <Badge className="bg-cyan-600 text-white">
                        {analysis?.collective_consciousness?.consciousness_level || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Entanglements:</span>
                      <span className="text-white">{analysis?.collective_consciousness?.active_entanglements || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mesh Health:</span>
                      <Badge variant={analysis?.collective_consciousness?.mesh_health === 'healthy' ? 'default' : 'secondary'}>
                        {analysis?.collective_consciousness?.mesh_health || 'Unknown'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Collective Decision */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-yellow-400" />
                      Collective Decision
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Proposed Action:</span>
                      <Badge className={`${getActionColor(analysis?.collective_decision?.proposed_action)} bg-transparent border-current`}>
                        {analysis?.collective_decision?.proposed_action || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Execution Confidence:</span>
                        <span className="text-white">{analysis?.collective_decision?.execution_confidence || 0}%</span>
                      </div>
                      <Progress value={analysis?.collective_decision?.execution_confidence || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Should Execute:</span>
                      <Badge variant={analysis?.collective_decision?.should_execute ? 'default' : 'secondary'}>
                        {analysis?.collective_decision?.should_execute ? 'YES' : 'NO'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Support:</span>
                      <Badge className="bg-yellow-600 text-white">
                        {analysis?.collective_decision?.collective_support || 'Unknown'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="consensus" className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Multi-Node Order Consensus</CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time consensus analysis from distributed Waides KI nodes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isConsensusLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                      <span className="ml-2 text-green-400">Loading consensus data...</span>
                    </div>
                  ) : consensusData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white">Consensus Analysis</h4>
                          <p className="text-gray-300">{consensusData.interpretation?.interpretation || 'No interpretation available'}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white">Network Statistics</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Active Peers:</span>
                              <span className="text-white">{consensusData.network_stats?.active_peers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Consensus Strength:</span>
                              <span className="text-white">{consensusData.network_stats?.consensus_strength || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      No consensus data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">ETH Sentiment Tracker</CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time market sentiment analysis and trading signals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSentimentLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                      <span className="ml-2 text-purple-400">Loading sentiment data...</span>
                    </div>
                  ) : sentimentData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Current Sentiment</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Overall:</span>
                              <Badge className={`${getSentimentColor(sentimentData.current_sentiment?.overall_sentiment)} bg-transparent border-current`}>
                                {sentimentData.current_sentiment?.overall_sentiment || 'Unknown'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Score:</span>
                              <span className="text-white">{sentimentData.current_sentiment?.score || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Trend:</span>
                              <span className="text-white">{sentimentData.current_sentiment?.trend || 'stable'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Trading Signal</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Signal:</span>
                              <span className="text-white">{sentimentData.trading_signal?.trading_signal || 'None'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-white">{sentimentData.trading_signal?.confidence_level || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      No sentiment data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orchestrator" className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Presence Orchestrator</CardTitle>
                  <CardDescription className="text-gray-400">
                    Coordinating multi-sense pressure, network consensus, and social sentiment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-gray-400">
                    Orchestrator data integration in progress...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mesh" className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Entangled Presence Mesh</CardTitle>
                  <CardDescription className="text-gray-400">
                    Shared presence exchange and collective consciousness network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isMeshLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                      <span className="ml-2 text-cyan-400">Loading mesh data...</span>
                    </div>
                  ) : meshData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Collective Consciousness</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Network Harmony:</span>
                              <span className="text-white">{meshData.collective_consciousness?.network_harmony || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Consciousness Level:</span>
                              <span className="text-white">{meshData.collective_consciousness?.consciousness_level || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Active Entanglements:</span>
                              <span className="text-white">{meshData.collective_consciousness?.active_entanglements || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Collective Presence</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Entangled Nodes:</span>
                              <span className="text-white">{meshData.collective_presence?.entangled_presences?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Consensus Strength:</span>
                              <span className="text-white">{meshData.collective_presence?.consensus_strength || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      No mesh data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conductor" className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Collective Trade Conductor</CardTitle>
                  <CardDescription className="text-gray-400">
                    Consensus vote engine with empathy weighting for collective trading decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isConductorLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                      <span className="ml-2 text-yellow-400">Loading conductor data...</span>
                    </div>
                  ) : conductorData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Current Proposal</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Action:</span>
                              <Badge className={`${getActionColor(conductorData.current_proposal?.action)} bg-transparent border-current`}>
                                {conductorData.current_proposal?.action || 'Unknown'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-white">{conductorData.current_proposal?.confidence || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Consensus Strength:</span>
                              <span className="text-white">{conductorData.current_proposal?.consensus_strength || 0}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">Trading Decision</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Should Execute:</span>
                              <Badge variant={conductorData.trading_decision?.should_execute ? 'default' : 'secondary'}>
                                {conductorData.trading_decision?.should_execute ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Execution Confidence:</span>
                              <span className="text-white">{conductorData.trading_decision?.execution_confidence || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Collective Support:</span>
                              <span className="text-white">{conductorData.trading_decision?.collective_support || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {conductorData.current_proposal?.reasoning && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-white mb-2">Reasoning</h4>
                          <p className="text-gray-300 text-sm">{conductorData.current_proposal.reasoning}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      No conductor data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* System Status Footer */}
          <Card className="bg-slate-900/30 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">
                    {analysis?.timestamp ? new Date(analysis.timestamp).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Multi-Node Sentience Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}