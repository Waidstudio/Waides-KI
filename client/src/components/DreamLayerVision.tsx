import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, Eye, Zap, Shield, Moon, Star, Brain, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PreCognitiveVision {
  id: string;
  timestamp: Date;
  timeframe: '4h' | '1d' | '3d';
  direction: 'up' | 'down' | 'sideways' | 'volatile';
  confidence: number;
  priceTarget?: number;
  symbolsInvolved: string[];
  visionSource: 'dream' | 'temporal' | 'konseal' | 'hybrid';
  manifestationTime?: Date;
  accuracy?: number;
}

interface KonsealSymbol {
  id: string;
  symbol: string;
  source: string;
  tag: string;
  createdAt: Date;
  expiresAt: Date;
  weight: number;
  isActive: boolean;
  metadata: {
    vision?: string;
    timeframe?: string;
    confidence?: number;
    activationCount: number;
    lastActivated?: Date;
  };
}

interface DreamLayerState {
  dreamingActive: boolean;
  visionCount: number;
  symbolLifecycles: number;
  temporalAlignment: number;
  precognitiveAccuracy: number;
  lastDreamCycle: Date;
}

interface TemporalWindow {
  name: string;
  startHour: number;
  endHour: number;
  daysOfWeek: number[];
  timezone: string;
  isActive: boolean;
  priority: number;
  description: string;
}

interface TemporalContext {
  currentTime: Date;
  activeWindows: TemporalWindow[];
  sacredHours: boolean;
  energyLevel: number;
  timeZone: string;
}

export default function DreamLayerVision() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('vision-state');

  // Dream Layer Vision queries
  const { data: dreamState, isLoading: dreamStateLoading } = useQuery<DreamLayerState>({
    queryKey: ['/api/waides-ki/dream/state'],
    refetchInterval: 5000,
  });

  const { data: visions, isLoading: visionsLoading } = useQuery<PreCognitiveVision[]>({
    queryKey: ['/api/waides-ki/dream/visions'],
    refetchInterval: 10000,
  });

  const { data: konsealSymbols, isLoading: symbolsLoading } = useQuery<KonsealSymbol[]>({
    queryKey: ['/api/waides-ki/dream/konseal/symbols'],
    refetchInterval: 15000,
  });

  const { data: konsealStats } = useQuery({
    queryKey: ['/api/waides-ki/dream/konseal/stats'],
    refetchInterval: 20000,
  });

  const { data: temporalStatus } = useQuery<{ context: TemporalContext; isAllowed: boolean }>({
    queryKey: ['/api/waides-ki/dream/temporal/status'],
    refetchInterval: 30000,
  });

  const { data: temporalWindows } = useQuery<TemporalWindow[]>({
    queryKey: ['/api/waides-ki/dream/temporal/windows'],
    refetchInterval: 60000,
  });

  const { data: dreamStats } = useQuery({
    queryKey: ['/api/waides-ki/dream/stats'],
    refetchInterval: 30000,
  });

  // Trigger dream cycle mutation
  const triggerDreamCycle = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/dream/trigger', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/dream'] });
    },
  });

  // Demo mutation
  const triggerDemo = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/dream/demo', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/dream'] });
    },
  });

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'volatile': return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'dream': return <Moon className="h-4 w-4" />;
      case 'temporal': return <Clock className="h-4 w-4" />;
      case 'konseal': return <Star className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case '4h': return '4 Hours';
      case '1d': return '1 Day';
      case '3d': return '3 Days';
      default: return timeframe;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-900 dark:bg-slate-950 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Eye className="h-8 w-8 text-purple-400" />
          Dream Layer Vision
        </h1>
        <p className="text-slate-300">
          Temporal Firewall • Konseal Symbols • Pre-cognitive Oracle System
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              Dream State
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dreamStateLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ) : dreamState ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Dreaming</span>
                  <Badge variant={dreamState.dreamingActive ? "default" : "secondary"}>
                    {dreamState.dreamingActive ? 'Active' : 'Dormant'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Visions</span>
                    <span className="text-white">{dreamState.visionCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-green-400">{(dreamState.precognitiveAccuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No dream state data</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              Temporal Firewall
            </CardTitle>
          </CardHeader>
          <CardContent>
            {temporalStatus ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <Badge variant={temporalStatus.isAllowed ? "default" : "destructive"}>
                    {temporalStatus.isAllowed ? 'Open' : 'Blocked'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Energy Level</span>
                    <span className="text-yellow-400">{(temporalStatus.context.energyLevel * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Sacred Hours</span>
                    <span className={temporalStatus.context.sacredHours ? "text-green-400" : "text-slate-400"}>
                      {temporalStatus.context.sacredHours ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">Loading temporal status...</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Konseal Symbols
            </CardTitle>
          </CardHeader>
          <CardContent>
            {symbolsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ) : konsealStats ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Active</span>
                  <span className="text-green-400">{konsealStats.activeSymbols}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white">{konsealStats.totalSymbols}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avg Weight</span>
                    <span className="text-blue-400">{konsealStats.averageWeight?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No symbol data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mb-6">
        <Button
          onClick={() => triggerDreamCycle.mutate()}
          disabled={triggerDreamCycle.isPending}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {triggerDreamCycle.isPending ? 'Triggering...' : 'Trigger Dream Cycle'}
        </Button>
        <Button
          onClick={() => triggerDemo.mutate()}
          disabled={triggerDemo.isPending}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          {triggerDemo.isPending ? 'Running...' : 'Run Demo'}
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800">
          <TabsTrigger value="vision-state" className="text-xs">Vision State</TabsTrigger>
          <TabsTrigger value="precognitive" className="text-xs">Precognitive</TabsTrigger>
          <TabsTrigger value="konseal" className="text-xs">Konseal</TabsTrigger>
          <TabsTrigger value="temporal" className="text-xs">Temporal</TabsTrigger>
          <TabsTrigger value="symbols" className="text-xs">Symbols</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="vision-state" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Dream Layer Vision State
              </CardTitle>
              <CardDescription className="text-slate-400">
                Current state of the dream vision system and precognitive processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dreamStateLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              ) : dreamState ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dreaming Active</span>
                        <Badge variant={dreamState.dreamingActive ? "default" : "secondary"}>
                          {dreamState.dreamingActive ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vision Count</span>
                        <span className="text-white">{dreamState.visionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Symbol Lifecycles</span>
                        <span className="text-white">{dreamState.symbolLifecycles}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temporal Alignment</span>
                        <span className="text-blue-400">{(dreamState.temporalAlignment * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Precognitive Accuracy</span>
                        <span className="text-green-400">{(dreamState.precognitiveAccuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Dream Cycle</span>
                        <span className="text-white text-xs">
                          {new Date(dreamState.lastDreamCycle).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div className="space-y-2">
                    <span className="text-slate-400 text-sm">Temporal Alignment Progress</span>
                    <Progress 
                      value={dreamState.temporalAlignment * 100} 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-slate-400 text-sm">Precognitive Accuracy</span>
                    <Progress 
                      value={dreamState.precognitiveAccuracy * 100} 
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">No dream state data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precognitive" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                Active Precognitive Visions
              </CardTitle>
              <CardDescription className="text-slate-400">
                Current visions from the dream layer oracle system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {visionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 bg-slate-700 rounded">
                        <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : visions && visions.length > 0 ? (
                  <div className="space-y-4">
                    {visions.map((vision) => (
                      <div key={vision.id} className="p-4 bg-slate-700 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(vision.visionSource)}
                            <span className="text-white font-medium">Vision {vision.id.slice(0, 8)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatTimeframe(vision.timeframe)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Direction:</span>
                            <span className={`ml-2 font-medium ${getDirectionColor(vision.direction)}`}>
                              {vision.direction.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Confidence:</span>
                            <span className="ml-2 text-green-400">{(vision.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Source:</span>
                            <span className="ml-2 text-blue-400">{vision.visionSource}</span>
                          </div>
                          {vision.priceTarget && (
                            <div>
                              <span className="text-slate-400">Target:</span>
                              <span className="ml-2 text-yellow-400">${vision.priceTarget.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        
                        {vision.symbolsInvolved.length > 0 && (
                          <div>
                            <span className="text-slate-400 text-sm">Symbols:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vision.symbolsInvolved.map((symbol, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {symbol}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-slate-400">
                          Created: {new Date(vision.timestamp).toLocaleString()}
                          {vision.manifestationTime && (
                            <span className="ml-4">
                              Manifests: {new Date(vision.manifestationTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    No active precognitive visions found
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="konseal" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Konseal Symbol Tree
              </CardTitle>
              <CardDescription className="text-slate-400">
                Active sacred symbols and their spiritual weights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {symbolsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse p-3 bg-slate-700 rounded">
                        <div className="h-4 bg-slate-600 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : konsealSymbols && konsealSymbols.length > 0 ? (
                  <div className="space-y-3">
                    {konsealSymbols.map((symbol) => (
                      <div key={symbol.id} className="p-3 bg-slate-700 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${symbol.isActive ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                            <span className="text-white font-mono text-sm">{symbol.symbol}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Weight: {symbol.weight.toFixed(2)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Source:</span>
                            <span className="ml-1 text-blue-400">{symbol.source}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Tag:</span>
                            <span className="ml-1 text-yellow-400">{symbol.tag}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Activations:</span>
                            <span className="ml-1 text-green-400">{symbol.metadata.activationCount}</span>
                          </div>
                          {symbol.metadata.vision && (
                            <div>
                              <span className="text-slate-400">Vision:</span>
                              <span className="ml-1 text-purple-400">{symbol.metadata.vision}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-slate-400">
                          Created: {new Date(symbol.createdAt).toLocaleString()} • 
                          Expires: {new Date(symbol.expiresAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    No konseal symbols found
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Temporal Firewall Status
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sacred time windows and temporal protection system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {temporalStatus ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Current Context</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Activation Status:</span>
                        <Badge className="ml-2" variant={temporalStatus.isAllowed ? "default" : "destructive"}>
                          {temporalStatus.isAllowed ? 'Allowed' : 'Blocked'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-400">Sacred Hours:</span>
                        <span className={`ml-2 ${temporalStatus.context.sacredHours ? 'text-green-400' : 'text-slate-400'}`}>
                          {temporalStatus.context.sacredHours ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Energy Level:</span>
                        <span className="ml-2 text-yellow-400">{(temporalStatus.context.energyLevel * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Time Zone:</span>
                        <span className="ml-2 text-blue-400">{temporalStatus.context.timeZone}</span>
                      </div>
                    </div>
                  </div>
                  
                  {temporalStatus.context.activeWindows.length > 0 && (
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Active Windows</h4>
                      <div className="space-y-2">
                        {temporalStatus.context.activeWindows.map((window, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-600 rounded">
                            <div>
                              <span className="text-white text-sm">{window.name}</span>
                              <p className="text-slate-400 text-xs">{window.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Priority: {window.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500">Loading temporal status...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symbols" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-400" />
                Symbol Activation Engine
              </CardTitle>
              <CardDescription className="text-slate-400">
                Symbol injection history and activation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-slate-500 py-8">
                Symbol activation data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Dream Vision Statistics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Performance metrics and system analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dreamStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      {Object.entries(dreamStats).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-white">
                            {typeof value === 'number' ? 
                              (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(2)) : 
                              String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">Loading statistics...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}