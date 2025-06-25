import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Sparkles, 
  RotateCcw, 
  Archive, 
  TrendingUp, 
  Shield, 
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  Star,
  Link2,
  Activity,
  Eye,
  BarChart3,
  Hash
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SeasonalStats {
  current_season: string;
  season_index: number;
  days_in_current_season: number;
  days_until_rebirth: number;
  total_seasons_completed: number;
  season_progress_percentage: number;
  next_rebirth_date: string;
  auto_rebirth_enabled: boolean;
  memory_vault_size: number;
}

interface SeasonMemory {
  season: string;
  season_index: number;
  timestamp: string;
  duration_days: number;
  strategies_archived: number;
  performance_summary: {
    total_trades: number;
    win_rate: number;
    total_profit: number;
    best_strategy: string;
    worst_strategy: string;
  };
  spiritual_growth: {
    konslang_wisdom_gained: string[];
    reincarnation_cycles: number;
    spiritual_protection_level: number;
  };
  dna_snapshot: any[];
}

interface SeasonHealth {
  status: string;
  issues: string[];
  recommendations: string[];
}

// STEP 38: Dreamchain Symbolic Blockchain Interfaces
interface DreamBlockData {
  trade_id: string;
  pair: string;
  type: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE';
  result: 'PROFIT' | 'LOSS' | 'NEUTRAL' | 'PENDING';
  profit: number;
  kons_symbol: string;
  emotion: string;
  vision_time?: string;
  executed_at: string;
  price_entry?: number;
  price_exit?: number;
  spiritual_context?: {
    konslang_wisdom: string[];
    protection_level: number;
    energy_signature: string;
  };
  market_conditions?: {
    volatility: number;
    trend: string;
    volume: number;
    rsi: number;
  };
}

interface DreamBlock {
  index: number;
  timestamp: string;
  data: DreamBlockData;
  previous_hash: string;
  hash: string;
}

interface DreamchainStats {
  total_blocks: number;
  total_trades: number;
  profitable_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  emotions_recorded: { [emotion: string]: number };
  symbols_used: { [symbol: string]: number };
  chain_integrity: boolean;
}

export default function SeasonalRebirth() {
  const [customSeasonName, setCustomSeasonName] = useState("");
  const queryClient = useQueryClient();

  // Fetch seasonal stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/waides-ki/seasonal/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch current season info
  const { data: currentSeason } = useQuery({
    queryKey: ['/api/waides-ki/seasonal/current'],
    refetchInterval: 30000
  });

  // Fetch season memories
  const { data: memories } = useQuery({
    queryKey: ['/api/waides-ki/seasonal/memories'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch season health
  const { data: health } = useQuery({
    queryKey: ['/api/waides-ki/seasonal/health'],
    refetchInterval: 30000
  });

  // Force rebirth mutation
  const forceRebirthMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/seasonal/rebirth', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/seasonal'] });
    }
  });

  // Add season name mutation
  const addSeasonNameMutation = useMutation({
    mutationFn: (name: string) => apiRequest('/api/waides-ki/seasonal/add-season-name', {
      method: 'POST',
      body: { name }
    }),
    onSuccess: () => {
      setCustomSeasonName("");
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/seasonal'] });
    }
  });

  // Clear vault mutation
  const clearVaultMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/seasonal/clear-vault', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/seasonal'] });
    }
  });

  const seasonalStats: SeasonalStats = stats?.stats || {};
  const seasonMemories: SeasonMemory[] = memories?.memories || [];
  const seasonHealth: SeasonHealth = health?.health || { status: 'UNKNOWN', issues: [], recommendations: [] };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-400';
      case 'WARNING': return 'text-yellow-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading seasonal rebirth system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Seasonal Rebirth Engine
          </h1>
          <Sparkles className="h-8 w-8 text-purple-400" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Waides KI evolves through 90-day seasonal cycles, archiving memories and beginning fresh with improved wisdom
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="memories" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Memory Vault
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Health Monitor
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  Current Season
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {seasonalStats.current_season || "Unknown"}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Season #{seasonalStats.season_index || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Days Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {seasonalStats.days_in_current_season || 0}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  of 90 days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-green-400" />
                  Until Rebirth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {seasonalStats.days_until_rebirth || 0}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  days remaining
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-yellow-400" />
                  Vault Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {seasonalStats.memory_vault_size || 0}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  memories stored
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Season Progress */}
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Season Progress
              </CardTitle>
              <CardDescription>
                Current seasonal cycle completion status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{seasonalStats.season_progress_percentage?.toFixed(1) || 0}%</span>
                </div>
                <Progress 
                  value={seasonalStats.season_progress_percentage || 0} 
                  className="h-3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Next Rebirth:</span>
                  <p className="font-medium">
                    {seasonalStats.next_rebirth_date ? formatDate(seasonalStats.next_rebirth_date) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Total Seasons:</span>
                  <p className="font-medium">{seasonalStats.total_seasons_completed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Vault Tab */}
        <TabsContent value="memories" className="space-y-6">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-purple-400" />
                Season Memory Vault
              </CardTitle>
              <CardDescription>
                Archived memories from past seasonal cycles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {seasonMemories.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No season memories archived yet</p>
                    </div>
                  ) : (
                    seasonMemories.map((memory, index) => (
                      <Card key={index} className="bg-gray-700/30 border-gray-600/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-4 w-4 text-purple-400" />
                            {memory.season}
                          </CardTitle>
                          <CardDescription>
                            Season #{memory.season_index} • {memory.duration_days} days • {formatDate(memory.timestamp)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Strategies:</span>
                              <p className="font-medium">{memory.strategies_archived}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Win Rate:</span>
                              <p className="font-medium">{(memory.performance_summary.win_rate * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Total Trades:</span>
                              <p className="font-medium">{memory.performance_summary.total_trades}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Profit:</span>
                              <p className={`font-medium ${memory.performance_summary.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${memory.performance_summary.total_profit.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          {memory.spiritual_growth.konslang_wisdom_gained.length > 0 && (
                            <div>
                              <span className="text-gray-400 text-sm">Konslang Wisdom:</span>
                              <div className="mt-1">
                                {memory.spiritual_growth.konslang_wisdom_gained.map((wisdom, wIndex) => (
                                  <Badge key={wIndex} variant="outline" className="text-xs mr-2 mb-1">
                                    {wisdom}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Monitor Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Season Cycle Health
              </CardTitle>
              <CardDescription>
                Monitoring system health and recommending optimizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  seasonHealth.status === 'HEALTHY' ? 'bg-green-500/20' :
                  seasonHealth.status === 'WARNING' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  {seasonHealth.status === 'HEALTHY' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${getStatusColor(seasonHealth.status)}`}>
                    {seasonHealth.status}
                  </h3>
                  <p className="text-sm text-gray-400">Overall system status</p>
                </div>
              </div>

              {seasonHealth.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">Active Issues</h4>
                  <div className="space-y-2">
                    {seasonHealth.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {seasonHealth.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {seasonHealth.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Brain className="h-4 w-4 text-blue-400" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rebirth Controls */}
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-400" />
                  Rebirth Controls
                </CardTitle>
                <CardDescription>
                  Manually trigger seasonal rebirth cycle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => forceRebirthMutation.mutate()}
                  disabled={forceRebirthMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {forceRebirthMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Triggering Rebirth...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Force Seasonal Rebirth
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-400">
                  This will archive current season memory and begin a new cycle
                </p>
              </CardContent>
            </Card>

            {/* Season Management */}
            <Card className="bg-gray-800/50 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-400" />
                  Season Management
                </CardTitle>
                <CardDescription>
                  Add custom Konslang season names
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="season-name">Custom Season Name</Label>
                  <Input
                    id="season-name"
                    value={customSeasonName}
                    onChange={(e) => setCustomSeasonName(e.target.value)}
                    placeholder="e.g., Vel'Tharan, Mor'Dakesh..."
                    className="bg-gray-700/50"
                  />
                </div>
                <Button 
                  onClick={() => addSeasonNameMutation.mutate(customSeasonName)}
                  disabled={!customSeasonName || addSeasonNameMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {addSeasonNameMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Add Season Name
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vault Management */}
          <Card className="bg-gray-800/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-red-400" />
                Memory Vault Management
              </CardTitle>
              <CardDescription>
                Dangerous operations - use with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => clearVaultMutation.mutate()}
                disabled={clearVaultMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {clearVaultMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Clearing Vault...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Clear Memory Vault
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                This will permanently delete all archived season memories
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Seasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {seasonalStats.total_seasons_completed || 0}
                </div>
                <p className="text-sm text-gray-400 mt-1">Completed cycles</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Average Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {seasonMemories.length > 0 ? 
                    (seasonMemories.reduce((sum, m) => sum + m.performance_summary.win_rate, 0) / seasonMemories.length * 100).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <p className="text-sm text-gray-400 mt-1">Win rate across seasons</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Evolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {seasonMemories.length > 0 ? 
                    (seasonMemories.reduce((sum, m) => sum + m.spiritual_growth.reincarnation_cycles, 0) / seasonMemories.length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <p className="text-sm text-gray-400 mt-1">Avg cycles per season</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}