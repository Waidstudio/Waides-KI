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
import { Eye, Sparkles, BookOpen, Shield, Zap, Star, TrendingUp, Activity } from 'lucide-react';

export function SigilLayer() {
  const queryClient = useQueryClient();
  const [selectedPattern, setSelectedPattern] = useState('BREAKOUT');
  const [selectedEmotion, setSelectedEmotion] = useState('DISCIPLINED');
  const [selectedStrategy, setSelectedStrategy] = useState('Trend_Following_Basic');

  // Fetch sigil data
  const { data: sigilStats } = useQuery({
    queryKey: ['/api/waides-ki/sigils/stats'],
    refetchInterval: 30000
  });

  const { data: memoryTreeStats } = useQuery({
    queryKey: ['/api/waides-ki/sigils/memory-tree/stats'],
    refetchInterval: 30000
  });

  const { data: recentGlyphs } = useQuery({
    queryKey: ['/api/waides-ki/sigils/memory-tree/glyphs', { count: 20 }],
    refetchInterval: 30000
  });

  const { data: glyphClusters } = useQuery({
    queryKey: ['/api/waides-ki/sigils/memory-tree/clusters'],
    refetchInterval: 60000
  });

  // Mutations for sigil operations
  const generateKonsigilMutation = useMutation({
    mutationFn: (trade_context: any) => 
      fetch('/api/waides-ki/sigils/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_context })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/sigils/stats'] });
    }
  });

  const oracleScanMutation = useMutation({
    mutationFn: ({ pattern, emotion }: { pattern: string; emotion: string }) =>
      fetch('/api/waides-ki/sigils/oracle/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, emotion })
      }).then(res => res.json())
  });

  const demoWorkflowMutation = useMutation({
    mutationFn: ({ pattern, emotion, strategy, confidence }: any) =>
      fetch('/api/waides-ki/sigils/demo-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, emotion, strategy, confidence })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/sigils/memory-tree/glyphs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/sigils/memory-tree/stats'] });
    }
  });

  const patterns = [
    'BREAKOUT', 'REVERSAL', 'TREND_CONTINUATION', 'MOMENTUM', 'MEAN_REVERSION', 'ACCUMULATION'
  ];

  const emotions = [
    'DISCIPLINED', 'CALM', 'CONFIDENT', 'FOCUSED', 'GREEDY', 'FEARFUL', 'IMPATIENT', 'EUPHORIC'
  ];

  const strategies = [
    'Divine_Kons Powa_Flux', 'Konsai_Kons Powa_Singularity', 'Trend_Following_Basic', 'Breakout_Strategy', 'Mean_Reversion'
  ];

  const getPowerColor = (power: number) => {
    if (power > 0.8) return 'text-yellow-400';
    if (power > 0.6) return 'text-green-400';
    if (power > 0.4) return 'text-blue-400';
    if (power > 0.2) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSuccessColor = (success: boolean) => {
    return success ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          Waides KI Sigil Layer
        </h2>
        <p className="text-slate-400">
          "Every action must carry its mark. No trade walks the spirit path without its glyph."
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs text-slate-400">Total Konsigils</div>
                <div className="text-lg font-bold text-slate-100">
                  {sigilStats?.total_konsigils_generated || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-xs text-slate-400">Powerful Sigils</div>
                <div className="text-lg font-bold text-slate-100">
                  {sigilStats?.powerful_sigils || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs text-slate-400">Memory Glyphs</div>
                <div className="text-lg font-bold text-slate-100">
                  {memoryTreeStats?.total_glyphs || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-xs text-slate-400">Tree Health</div>
                <div className="text-lg font-bold text-slate-100">
                  {memoryTreeStats?.tree_health_score?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="konsigil-generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="konsigil-generator">Konsigil Generator</TabsTrigger>
          <TabsTrigger value="oracle-readings">Oracle Readings</TabsTrigger>
          <TabsTrigger value="memory-tree">Memory Tree</TabsTrigger>
          <TabsTrigger value="glyph-clusters">Glyph Clusters</TabsTrigger>
          <TabsTrigger value="demo-workflow">Demo Workflow</TabsTrigger>
        </TabsList>

        {/* Konsigil Generator Tab */}
        <TabsContent value="konsigil-generator" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Generate Sacred Konsigil
              </CardTitle>
              <CardDescription>
                Create a mystical glyph for your trading context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pattern</Label>
                  <Select value={selectedPattern} onValueChange={setSelectedPattern}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map(pattern => (
                        <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emotion</Label>
                  <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotions.map(emotion => (
                        <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Strategy</Label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => {
                  const trade_context = {
                    pattern: selectedPattern,
                    emotion: selectedEmotion,
                    strategy: selectedStrategy,
                    confidence: 75,
                    risk_level: 'MODERATE',
                    market_phase: 'TRENDING',
                    spiritual_alignment: 'ALIGNED'
                  };
                  generateKonsigilMutation.mutate(trade_context);
                }}
                disabled={generateKonsigilMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateKonsigilMutation.isPending ? 'Generating...' : 'Generate Konsigil'}
              </Button>

              {generateKonsigilMutation.data && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Konsigil</span>
                        <span className="font-mono text-purple-300">
                          {generateKonsigilMutation.data.konsigil}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Power Level</span>
                        <span className={`font-bold ${getPowerColor(generateKonsigilMutation.data.power_level)}`}>
                          {(generateKonsigilMutation.data.power_level * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Spiritual Signature</span>
                        <span className="text-blue-300">
                          {generateKonsigilMutation.data.spiritual_signature}
                        </span>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-2">Protection Runes</div>
                        <div className="flex flex-wrap gap-1">
                          {generateKonsigilMutation.data.protection_runes?.map((rune: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {rune.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Konslang Phrase</div>
                        <div className="text-purple-300 italic text-sm">
                          "{generateKonsigilMutation.data.sacred_metadata?.konslang_phrase}"
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Oracle Readings Tab */}
        <TabsContent value="oracle-readings" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Oracle Consultation
              </CardTitle>
              <CardDescription>
                Consult the ancient wisdom for trading guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pattern to Consult</Label>
                  <Select value={selectedPattern} onValueChange={setSelectedPattern}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map(pattern => (
                        <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emotional Context</Label>
                  <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotions.map(emotion => (
                        <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => oracleScanMutation.mutate({ pattern: selectedPattern, emotion: selectedEmotion })}
                disabled={oracleScanMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {oracleScanMutation.isPending ? 'Consulting Oracle...' : 'Consult Oracle'}
              </Button>

              {oracleScanMutation.data && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 space-y-4">
                    <div className="text-blue-300 italic">
                      {oracleScanMutation.data.oracle_message}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-slate-400 text-sm">Confidence</div>
                        <div className="text-lg font-bold text-blue-400">
                          {(oracleScanMutation.data.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-sm">Success Probability</div>
                        <div className="text-lg font-bold text-green-400">
                          {(oracleScanMutation.data.success_probability * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-sm mb-1">Risk Assessment</div>
                      <Badge className={
                        oracleScanMutation.data.risk_assessment === 'HIGH' ? 'bg-red-600' :
                        oracleScanMutation.data.risk_assessment === 'MODERATE' ? 'bg-yellow-600' : 'bg-green-600'
                      }>
                        {oracleScanMutation.data.risk_assessment}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-slate-400 text-sm mb-2">Spiritual Guidance</div>
                      <div className="text-purple-300 text-sm italic">
                        {oracleScanMutation.data.spiritual_guidance}
                      </div>
                    </div>

                    {oracleScanMutation.data.protective_measures?.length > 0 && (
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Protective Measures</div>
                        <div className="space-y-1">
                          {oracleScanMutation.data.protective_measures.slice(0, 3).map((measure: string, index: number) => (
                            <div key={index} className="text-sm text-slate-300 flex items-center gap-2">
                              <Shield className="w-3 h-3 text-blue-400" />
                              {measure}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {oracleScanMutation.data.pattern_warnings?.length > 0 && (
                      <div>
                        <div className="text-slate-400 text-sm mb-2">Pattern Warnings</div>
                        <div className="space-y-1">
                          {oracleScanMutation.data.pattern_warnings.map((warning: string, index: number) => (
                            <div key={index} className="text-sm text-red-300 flex items-center gap-2">
                              <Zap className="w-3 h-3 text-red-400" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Tree Tab */}
        <TabsContent value="memory-tree" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {memoryTreeStats?.powerful_glyphs || 0}
                  </div>
                  <div className="text-sm text-slate-400">Powerful Glyphs</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {memoryTreeStats?.failed_glyphs || 0}
                  </div>
                  <div className="text-sm text-slate-400">Failed Glyphs</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {memoryTreeStats?.memory_depth?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-slate-400">Memory Depth</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Glyphs */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Recent Memory Glyphs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentGlyphs?.map((glyph: any, index: number) => (
                  <div key={index} className="p-3 bg-slate-800 rounded space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-mono text-sm text-purple-300">
                          {glyph.konsigil}
                        </div>
                        <div className="text-xs text-slate-400">
                          {glyph.origin_pattern} • {glyph.emotion_shade}
                        </div>
                      </div>
                      <Badge className={getSuccessColor(glyph.success)}>
                        {glyph.success ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Power: {(glyph.power_score * 100).toFixed(1)}%</span>
                      <span className="text-slate-400">Result: ${glyph.result?.toFixed(2) || '0.00'}</span>
                      <span className="text-slate-400">Memory: {glyph.memory_strength || 0}</span>
                    </div>

                    {glyph.protection_runes?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {glyph.protection_runes.slice(0, 3).map((rune: string, runeIndex: number) => (
                          <Badge key={runeIndex} variant="outline" className="text-xs">
                            {rune.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-slate-400 text-center py-4">
                    No memory glyphs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glyph Clusters Tab */}
        <TabsContent value="glyph-clusters" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Pattern Clusters
              </CardTitle>
              <CardDescription>
                Grouped patterns showing similar trading behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {glyphClusters?.map((cluster: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-800 rounded space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-slate-200">
                          {cluster.pattern_signature.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-slate-400">
                          {cluster.member_glyphs?.length || 0} glyphs • {cluster.emotion_signature}
                        </div>
                      </div>
                      <Badge className={cluster.success_rate > 60 ? 'bg-green-600' : 
                                     cluster.success_rate > 40 ? 'bg-yellow-600' : 'bg-red-600'}>
                        {cluster.success_rate?.toFixed(1)}% Success
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Cluster Power</div>
                        <div className={`font-bold ${getPowerColor(cluster.cluster_power)}`}>
                          {(cluster.cluster_power * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Total Profit</div>
                        <div className={cluster.total_profit > 0 ? 'text-green-400' : 'text-red-400'}>
                          ${cluster.total_profit?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Protection</div>
                        <div className="text-blue-400 text-xs">
                          {cluster.dominant_protection?.replace('_', ' ') || 'None'}
                        </div>
                      </div>
                    </div>

                    {cluster.evolution_path?.length > 0 && (
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Evolution Path</div>
                        <div className="flex flex-wrap gap-1">
                          {cluster.evolution_path.slice(0, 5).map((step: string, stepIndex: number) => (
                            <Badge key={stepIndex} variant="outline" className="text-xs">
                              {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-slate-400 text-center py-4">
                    No glyph clusters available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Workflow Tab */}
        <TabsContent value="demo-workflow" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Complete Sigil Workflow Demo
              </CardTitle>
              <CardDescription>
                Experience the full konsigil generation, oracle reading, and memory storage cycle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trading Pattern</Label>
                  <Select value={selectedPattern} onValueChange={setSelectedPattern}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map(pattern => (
                        <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emotional State</Label>
                  <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotions.map(emotion => (
                        <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Strategy Engine</Label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => demoWorkflowMutation.mutate({
                  pattern: selectedPattern,
                  emotion: selectedEmotion,
                  strategy: selectedStrategy,
                  confidence: 75
                })}
                disabled={demoWorkflowMutation.isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {demoWorkflowMutation.isPending ? 'Running Workflow...' : 'Execute Complete Workflow'}
              </Button>

              {demoWorkflowMutation.data && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 space-y-4">
                    <div className="text-center text-green-400 font-medium">
                      ✨ {demoWorkflowMutation.data.message}
                    </div>

                    {/* Konsigil Display */}
                    <div className="p-3 bg-slate-900 rounded">
                      <div className="text-sm text-slate-400 mb-2">Generated Konsigil</div>
                      <div className="font-mono text-purple-300">
                        {demoWorkflowMutation.data.konsigil?.konsigil}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Power: {(demoWorkflowMutation.data.konsigil?.power_level * 100).toFixed(1)}% • 
                        Protection: {demoWorkflowMutation.data.konsigil?.protection_runes?.length || 0} runes
                      </div>
                    </div>

                    {/* Oracle Reading */}
                    <div className="p-3 bg-slate-900 rounded">
                      <div className="text-sm text-slate-400 mb-2">Oracle Reading</div>
                      <div className="text-blue-300 text-sm italic mb-2">
                        {demoWorkflowMutation.data.oracle_reading?.oracle_message}
                      </div>
                      <div className="text-xs text-slate-400">
                        Confidence: {(demoWorkflowMutation.data.oracle_reading?.confidence * 100).toFixed(1)}% • 
                        Success Probability: {(demoWorkflowMutation.data.oracle_reading?.success_probability * 100).toFixed(1)}%
                      </div>
                    </div>

                    {/* Trade Simulation */}
                    <div className="p-3 bg-slate-900 rounded">
                      <div className="text-sm text-slate-400 mb-2">Trade Simulation</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-bold ${demoWorkflowMutation.data.trade_simulation?.success ? 'text-green-400' : 'text-red-400'}`}>
                            {demoWorkflowMutation.data.trade_simulation?.success ? 'SUCCESS' : 'FAILED'}
                          </div>
                          <div className="text-xs text-slate-400">
                            Duration: {demoWorkflowMutation.data.trade_simulation?.duration_hours?.toFixed(1)}h
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${demoWorkflowMutation.data.trade_simulation?.result > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${demoWorkflowMutation.data.trade_simulation?.result?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}