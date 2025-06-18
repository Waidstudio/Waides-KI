import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import EthCommunicationEngine from "@/components/EthCommunicationEngine";
import DivineCommandCenter from "@/components/DivineCommandCenter";
import CandlestickChart from "@/components/CandlestickChart";
import RealTimeTrading from "@/components/RealTimeTrading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff, Menu, Brain } from "lucide-react";
import { Link, useLocation } from "wouter";

interface EthData {
  price: number;
  volume?: number;
  marketCap?: number;
  priceChange24h?: number;
  fearGreedIndex?: number;
  timestamp: number;
}

interface Signal {
  type: 'LONG' | 'SHORT' | 'HOLD';
  confidence: number;
  entryPoint: number;
  targetPrice: number;
  stopLoss: number;
  description: string;
  konsMessage: string;
  technicalStrength: number;
  volumeStrength: number;
  sentimentStrength: number;
}

interface SpiritualReading {
  spiritMessage: string;
  frequency: string;
  konsKey: string;
  emotionalEnergy: string;
  sacredTime: string;
  dimensionalShift: number;
  konsRank: 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT';
  personalAura: number;
  ethMovement: {
    direction: 'HOME' | 'OUT' | 'RESTING';
    message: string;
    confidence: number;
  };
}

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/divine-reading'],
    refetchInterval: 10000,
  });

  const { data: candlestickData } = useQuery({
    queryKey: ['/api/candlesticks', 'ETHUSDT', '1m'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const ethData: EthData = (data as any)?.ethData || { price: 0, timestamp: Date.now() };
  const signal: Signal = (data as any)?.signal;
  const spiritualReading: SpiritualReading = (data as any)?.spiritualReading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-950/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center justify-between p-4 lg:px-6">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
              
              {/* Navigation & Header Title */}
              <div className="flex items-center space-x-6">
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Waides AI
                  </h1>
                  <p className="text-xs text-slate-400 hidden lg:block">Next-Gen ETH Trading Intelligence</p>
                </div>
                
                {/* Navigation Menu */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link href="/" className="inline-block">
                    <Button variant="ghost" className="text-xs sm:text-sm px-2 sm:px-4 py-2 hover:bg-slate-700/50 transition-colors text-slate-200">
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">Home</span>
                    </Button>
                  </Link>
                  <Link href="/waidbot" className="inline-block">
                    <Button variant="ghost" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex items-center space-x-1 hover:bg-slate-700/50 transition-colors text-slate-200">
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">WaidBot</span>
                      <span className="sm:hidden">Bot</span>
                    </Button>
                  </Link>
                  <Link href="/waidbot-pro" className="inline-block">
                    <Button variant="ghost" className="text-xs sm:text-sm px-2 sm:px-4 py-2 flex items-center space-x-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:from-blue-600/30 hover:to-purple-600/30 transition-colors">
                      <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                      <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">WaidBot Pro</span>
                      <span className="sm:hidden bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">Pro</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
                
            {/* Status Indicators */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-400 hidden sm:inline">KonsLang</span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium hidden sm:inline ${
                  isConnected ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 space-y-8 max-w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                        <div className="h-6 bg-slate-700 rounded w-1/2"></div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                {/* ETH Price & Signal Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Real-time ETH Price Card */}
                    <Card className="bg-slate-900/50 border-slate-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl font-bold text-white">
                              ${ethData?.price?.toFixed(2) || '0.00'}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                              Ethereum (ETH)
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              (ethData?.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {(ethData?.priceChange24h || 0) >= 0 ? '+' : ''}{ethData?.priceChange24h?.toFixed(2) || '0.00'}%
                            </div>
                            <div className="text-xs text-slate-500">24h Change</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Volume</div>
                            <div className="font-medium">${(ethData?.volume || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Market Cap</div>
                            <div className="font-medium">${(ethData?.marketCap || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Fear & Greed</div>
                            <div className="font-medium">{ethData?.fearGreedIndex || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Updated</div>
                            <div className="font-medium text-xs">
                              {ethData?.timestamp ? new Date(ethData.timestamp).toLocaleTimeString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Trading Signal Card */}
                    {signal && (
                      <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Current Signal</CardTitle>
                            <Badge variant={signal.type === 'LONG' ? 'default' : signal.type === 'SHORT' ? 'destructive' : 'secondary'}>
                              {signal.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400">Entry Point</div>
                              <div className="font-medium">${signal.entryPoint?.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Target</div>
                              <div className="font-medium text-green-400">${signal.targetPrice?.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Stop Loss</div>
                              <div className="font-medium text-red-400">${signal.stopLoss?.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Confidence</div>
                              <div className="font-medium">{signal.confidence}%</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Technical Strength</span>
                              <span>{signal.technicalStrength}%</span>
                            </div>
                            <Progress value={signal.technicalStrength} className="h-1" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Volume Strength</span>
                              <span>{signal.volumeStrength}%</span>
                            </div>
                            <Progress value={signal.volumeStrength} className="h-1" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>Sentiment Strength</span>
                              <span>{signal.sentimentStrength}%</span>
                            </div>
                            <Progress value={signal.sentimentStrength} className="h-1" />
                          </div>
                          
                          <Separator />
                          <div className="bg-slate-800/50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-slate-300 mb-1">Analysis</div>
                            <div className="text-sm text-slate-400">{signal.description}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Candlestick Chart */}
                    <Card className="bg-slate-900/50 border-slate-800">
                      <CardHeader>
                        <CardTitle className="text-lg">ETH/USDT Chart</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CandlestickChart />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    {/* Spiritual Reading */}
                    {spiritualReading && (
                      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-lg text-purple-300">Kons Spiritual Reading</CardTitle>
                          <CardDescription className="text-purple-400">
                            Rank: {spiritualReading.konsRank} | Aura: {spiritualReading.personalAura}%
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-sm text-purple-200">{spiritualReading.spiritMessage}</div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-purple-400">Frequency</div>
                              <div className="text-purple-200">{spiritualReading.frequency}</div>
                            </div>
                            <div>
                              <div className="text-purple-400">Sacred Time</div>
                              <div className="text-purple-200">{spiritualReading.sacredTime}</div>
                            </div>
                          </div>
                          
                          <div className="bg-purple-800/30 p-3 rounded-lg">
                            <div className="text-sm font-medium text-purple-300 mb-1">ETH Movement</div>
                            <div className="text-sm text-purple-200">{spiritualReading.ethMovement.message}</div>
                            <div className="text-xs text-purple-400 mt-1">
                              Direction: {spiritualReading.ethMovement.direction} ({spiritualReading.ethMovement.confidence}%)
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* ETH Communication Engine */}
                    <EthCommunicationEngine 
                      ethMovement={spiritualReading?.ethMovement || { direction: 'RESTING', message: 'Initializing...', confidence: 0 }}
                      konsRank={spiritualReading?.konsRank || 'NOVICE'}
                      dimensionalShift={spiritualReading?.dimensionalShift || 0}
                      sacredTime={spiritualReading?.sacredTime || 'Normal Time'}
                    />
                    
                    {/* Divine Command Center */}
                    <DivineCommandCenter />
                    
                    {/* Real-time Trading */}
                    <RealTimeTrading />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}