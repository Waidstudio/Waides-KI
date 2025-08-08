import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Volume2,
  Bell,
  Settings,
  Zap,
  Target,
  AlertTriangle,
  DollarSign,
  Eye,
  Brain,
  Layers,
  LineChart,
  PieChart,
  Gauge
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";

interface Candlestick {
  id: number;
  symbol: string;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: string;
  isFinal: boolean;
  createdAt: string;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
}

interface PriceAlert {
  id: string;
  symbol: string;
  price: number;
  condition: 'above' | 'below';
  isActive: boolean;
  created: string;
}

interface MarketSentiment {
  fearGreedIndex: number;
  socialSentiment: number;
  newsImpact: number;
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
}

interface AdvancedRealTimeChartsProps {
  symbol?: string;
  interval?: string;
  limit?: number;
}

export default function AdvancedRealTimeCharts({ 
  symbol = "ETHUSDT", 
  interval: defaultInterval = "1m", 
  limit = 100
}: AdvancedRealTimeChartsProps) {
  const [selectedInterval, setSelectedInterval] = useState(defaultInterval);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [activeChartType, setActiveChartType] = useState<'candlestick' | 'line' | 'area'>('area');
  const [showTechnicals, setShowTechnicals] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [alertPrice, setAlertPrice] = useState("");
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Enhanced timeframes with more options
  const timeframes = [
    { value: "1m", label: "1m", color: "from-red-500 to-orange-400" },
    { value: "5m", label: "5m", color: "from-orange-500 to-yellow-400" },
    { value: "15m", label: "15m", color: "from-yellow-500 to-green-400" },
    { value: "30m", label: "30m", color: "from-green-500 to-teal-400" },
    { value: "1h", label: "1h", color: "from-teal-500 to-blue-400" },
    { value: "4h", label: "4h", color: "from-blue-500 to-indigo-400" },
    { value: "1d", label: "1d", color: "from-indigo-500 to-purple-400" },
    { value: "1w", label: "1w", color: "from-purple-500 to-pink-400" }
  ];

  // Expanded trading pairs with categories
  const tradingPairs = [
    { 
      category: "Major", 
      pairs: [
        { value: "ETHUSDT", label: "ETH/USDT", price: 3200, change: 4.2 },
        { value: "BTCUSDT", label: "BTC/USDT", price: 67000, change: 2.1 },
        { value: "BNBUSDT", label: "BNB/USDT", price: 580, change: -1.2 }
      ]
    },
    { 
      category: "DeFi", 
      pairs: [
        { value: "UNIUSDT", label: "UNI/USDT", price: 12.5, change: 6.8 },
        { value: "AAVEUSDT", label: "AAVE/USDT", price: 185, change: 3.2 },
        { value: "COMPUSDT", label: "COMP/USDT", price: 95, change: -2.1 }
      ]
    },
    { 
      category: "Layer 1", 
      pairs: [
        { value: "ADAUSDT", label: "ADA/USDT", price: 0.45, change: 8.1 },
        { value: "SOLUSDT", label: "SOL/USDT", price: 145, change: 5.7 },
        { value: "DOTUSDT", label: "DOT/USDT", price: 7.2, change: -0.8 }
      ]
    }
  ];

  // Fetch enhanced candlestick data
  const { data: candlestickData, isLoading: candlestickLoading, error: candlestickError, refetch: refetchCandlesticks } = useQuery({
    queryKey: ['/api/candlesticks', selectedSymbol, selectedInterval, limit],
    queryFn: async () => {
      const response = await fetch(`/api/candlesticks/${selectedSymbol}/${selectedInterval}?limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    },
    refetchInterval: selectedInterval === "1m" ? 10000 : selectedInterval === "5m" ? 30000 : 60000,
    staleTime: 5000,
    gcTime: 30000,
    retry: 2
  });

  // Mock technical indicators (in real app, this would come from backend)
  const technicalIndicators: TechnicalIndicator[] = useMemo(() => [
    { name: "RSI (14)", value: 65.2, signal: "HOLD", strength: 70 },
    { name: "MACD", value: 12.5, signal: "BUY", strength: 85 },
    { name: "MA (20)", value: 3185.7, signal: "BUY", strength: 75 },
    { name: "Bollinger", value: 3220.1, signal: "SELL", strength: 60 },
    { name: "Stochastic", value: 78.3, signal: "SELL", strength: 80 },
    { name: "Williams %R", value: -25.6, signal: "BUY", strength: 65 }
  ], [candlestickData]);

  // Mock market sentiment (in real app, this would come from backend)
  const marketSentiment: MarketSentiment = useMemo(() => ({
    fearGreedIndex: 72, // 0-100 scale
    socialSentiment: 68, // Twitter/Reddit sentiment
    newsImpact: 45, // News sentiment impact
    volumeTrend: 'increasing'
  }), []);

  // Process candlestick data for charts
  const processedData = useMemo(() => {
    if (!candlestickData?.data) return [];
    
    return candlestickData.data.map((candle: Candlestick, index: number) => ({
      time: new Date(candle.openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: candle.openTime,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      priceChange: index > 0 ? candle.close - candlestickData.data[index - 1].close : 0,
      priceChangePercent: index > 0 ? ((candle.close - candlestickData.data[index - 1].close) / candlestickData.data[index - 1].close) * 100 : 0
    }));
  }, [candlestickData]);

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    if (!processedData.length) return null;
    
    const latest = processedData[processedData.length - 1];
    const previous = processedData[processedData.length - 2];
    
    return {
      currentPrice: latest.close,
      change: latest.priceChange,
      changePercent: latest.priceChangePercent,
      volume24h: processedData.reduce((sum: number, item: any) => sum + item.volume, 0),
      high24h: Math.max(...processedData.map((item: any) => item.high)),
      low24h: Math.min(...processedData.map((item: any) => item.low)),
      volatility: Math.abs(latest.changePercent)
    };
  }, [processedData]);

  // Add price alert
  const addAlert = () => {
    if (!alertPrice || isNaN(Number(alertPrice))) return;
    
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      price: Number(alertPrice),
      condition: Number(alertPrice) > (metrics?.currentPrice || 0) ? 'above' : 'below',
      isActive: true,
      created: new Date().toISOString()
    };
    
    setAlerts(prev => [...prev, newAlert]);
    setAlertPrice("");
  };

  // Chart color themes
  const chartTheme = {
    primary: "#06b6d4", // cyan-500
    secondary: "#8b5cf6", // violet-500
    success: "#10b981", // emerald-500
    danger: "#ef4444", // red-500
    warning: "#f59e0b", // amber-500
    background: "rgba(15, 23, 42, 0.8)" // slate-900/80
  };

  if (candlestickLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-purple-950/30 border-slate-700/60 shadow-2xl backdrop-blur-lg">
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-300">Loading advanced market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (candlestickError) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/95 via-red-950/40 to-slate-950/30 border-red-500/30 shadow-2xl backdrop-blur-lg">
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <p className="text-red-300">Failed to load market data</p>
            <Button variant="outline" onClick={() => refetchCandlesticks()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-6 overflow-auto' : ''}`}>
      {/* Header Controls */}
      <Card className="bg-gradient-to-r from-slate-800/90 via-indigo-900/50 to-purple-900/40 border-slate-700/60 shadow-xl backdrop-blur-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  Advanced Real-Time Charts
                  <Badge className="ml-3 bg-green-500/20 text-green-300 border-green-500/30">
                    <Wifi className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                </CardTitle>
                <p className="text-slate-400 text-sm">Professional trading analytics with AI-powered insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-slate-600 hover:bg-slate-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCandlesticks()}
                className="border-slate-600 hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trading Pair & Timeframe Selection */}
      <Card className="bg-slate-800/90 border-slate-700/60 shadow-lg backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Pair Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Trading Pair</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600">
                  <SelectValue placeholder="Select trading pair" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {tradingPairs.map(category => (
                    <div key={category.category}>
                      <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {category.category}
                      </div>
                      {category.pairs.map(pair => (
                        <SelectItem key={pair.value} value={pair.value} className="hover:bg-slate-700">
                          <div className="flex items-center justify-between w-full">
                            <span>{pair.label}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400">${pair.price}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${pair.change > 0 ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}`}
                              >
                                {pair.change > 0 ? '+' : ''}{pair.change}%
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Timeframe</label>
              <div className="grid grid-cols-4 gap-2">
                {timeframes.map(timeframe => (
                  <Button
                    key={timeframe.value}
                    variant={selectedInterval === timeframe.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedInterval(timeframe.value)}
                    className={`
                      ${selectedInterval === timeframe.value 
                        ? `bg-gradient-to-r ${timeframe.color} text-white border-transparent` 
                        : 'border-slate-600 hover:bg-slate-700 text-slate-300'
                      }
                    `}
                  >
                    {timeframe.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border-cyan-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-400 font-medium">CURRENT PRICE</p>
                  <p className="text-lg font-bold text-white">${metrics.currentPrice.toFixed(2)}</p>
                </div>
                <DollarSign className="w-5 h-5 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${metrics.change >= 0 ? 'from-green-900/30 to-emerald-900/20 border-green-500/30' : 'from-red-900/30 to-rose-900/20 border-red-500/30'}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${metrics.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>24H CHANGE</p>
                  <p className={`text-lg font-bold ${metrics.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {metrics.change >= 0 ? '+' : ''}{metrics.changePercent.toFixed(2)}%
                  </p>
                </div>
                {metrics.change >= 0 ? 
                  <TrendingUp className="w-5 h-5 text-green-400" /> : 
                  <TrendingDown className="w-5 h-5 text-red-400" />
                }
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/20 border-purple-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-400 font-medium">24H HIGH</p>
                  <p className="text-lg font-bold text-white">${metrics.high24h.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-amber-900/20 border-orange-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-400 font-medium">24H LOW</p>
                  <p className="text-lg font-bold text-white">${metrics.low24h.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-5 h-5 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border-indigo-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-400 font-medium">VOLUME</p>
                  <p className="text-lg font-bold text-white">{(metrics.volume24h / 1000000).toFixed(1)}M</p>
                </div>
                <Volume2 className="w-5 h-5 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border-yellow-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400 font-medium">VOLATILITY</p>
                  <p className="text-lg font-bold text-white">{metrics.volatility.toFixed(1)}%</p>
                </div>
                <Activity className="w-5 h-5 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chart and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-3">
          <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/50 to-slate-900/80 border-slate-700/60 shadow-2xl backdrop-blur-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <LineChart className="w-5 h-5 mr-2 text-cyan-400" />
                  Price Chart - {selectedSymbol}
                </CardTitle>
                
                <div className="flex items-center space-x-2">
                  {/* Chart Type Selection */}
                  <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
                    <Button
                      variant={activeChartType === 'line' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveChartType('line')}
                      className="px-3 py-1 text-xs"
                    >
                      Line
                    </Button>
                    <Button
                      variant={activeChartType === 'area' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveChartType('area')}
                      className="px-3 py-1 text-xs"
                    >
                      Area
                    </Button>
                    <Button
                      variant={activeChartType === 'candlestick' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveChartType('candlestick')}
                      className="px-3 py-1 text-xs"
                    >
                      Candlestick
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartType === 'line' ? (
                    <RechartsLineChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke={chartTheme.primary}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, stroke: chartTheme.primary, strokeWidth: 2 }}
                      />
                    </RechartsLineChart>
                  ) : activeChartType === 'area' ? (
                    <AreaChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="close" 
                        stroke={chartTheme.primary}
                        strokeWidth={2}
                        fill="url(#colorPrice)" 
                      />
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  ) : (
                    <ComposedChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        yAxisId="price"
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <YAxis 
                        yAxisId="volume"
                        orientation="right"
                        stroke="#64748b" 
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                        formatter={(value: any, name: string) => [
                          name === 'volume' ? `${(value / 1000000).toFixed(2)}M` : `$${value.toFixed(2)}`,
                          name === 'volume' ? 'Volume' : 'Price'
                        ]}
                      />
                      <Bar 
                        yAxisId="volume"
                        dataKey="volume" 
                        fill="#334155" 
                        opacity={0.3}
                      />
                      <Line 
                        yAxisId="price"
                        type="monotone" 
                        dataKey="close" 
                        stroke={chartTheme.primary}
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Technical Analysis & Tools */}
        <div className="space-y-6">
          {/* Technical Indicators */}
          <Card className="bg-gradient-to-br from-slate-800/90 via-indigo-900/30 to-slate-800/80 border-slate-700/60 shadow-lg backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-400" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {technicalIndicators.map((indicator, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">{indicator.name}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        indicator.signal === 'BUY' ? 'text-green-400 border-green-500/30' :
                        indicator.signal === 'SELL' ? 'text-red-400 border-red-500/30' :
                        'text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {indicator.signal}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{indicator.value}</span>
                    <span className="text-slate-500">{indicator.strength}%</span>
                  </div>
                  <Progress 
                    value={indicator.strength} 
                    className={`h-1 ${
                      indicator.signal === 'BUY' ? 'text-green-400' :
                      indicator.signal === 'SELL' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Market Sentiment */}
          <Card className="bg-gradient-to-br from-slate-800/90 via-purple-900/30 to-slate-800/80 border-slate-700/60 shadow-lg backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center">
                <Gauge className="w-4 h-4 mr-2 text-violet-400" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Fear & Greed Index</span>
                  <span className="text-xs font-bold text-white">{marketSentiment.fearGreedIndex}</span>
                </div>
                <Progress 
                  value={marketSentiment.fearGreedIndex} 
                  className={`h-2 ${marketSentiment.fearGreedIndex > 75 ? 'text-red-400' : marketSentiment.fearGreedIndex > 50 ? 'text-green-400' : 'text-yellow-400'}`}
                />
                <p className="text-xs text-slate-400">
                  {marketSentiment.fearGreedIndex > 75 ? 'Extreme Greed' :
                   marketSentiment.fearGreedIndex > 50 ? 'Greed' :
                   marketSentiment.fearGreedIndex > 25 ? 'Neutral' : 'Fear'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Social Sentiment</span>
                  <span className="text-xs font-bold text-white">{marketSentiment.socialSentiment}%</span>
                </div>
                <Progress value={marketSentiment.socialSentiment} className="h-1 text-blue-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">News Impact</span>
                  <span className="text-xs font-bold text-white">{marketSentiment.newsImpact}%</span>
                </div>
                <Progress value={marketSentiment.newsImpact} className="h-1 text-cyan-400" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-xs text-slate-300">Volume Trend</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    marketSentiment.volumeTrend === 'increasing' ? 'text-green-400 border-green-500/30' :
                    marketSentiment.volumeTrend === 'decreasing' ? 'text-red-400 border-red-500/30' :
                    'text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {marketSentiment.volumeTrend}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Price Alerts */}
          <Card className="bg-gradient-to-br from-slate-800/90 via-orange-900/30 to-slate-800/80 border-slate-700/60 shadow-lg backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center">
                <Bell className="w-4 h-4 mr-2 text-orange-400" />
                Price Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Alert price"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white text-xs"
                />
                <Button 
                  size="sm" 
                  onClick={addAlert}
                  className="bg-orange-600 hover:bg-orange-700 text-xs"
                >
                  <Target className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-white font-medium">
                          {alert.symbol} {alert.condition} ${alert.price}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(alert.created).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  
                  {alerts.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">
                      No active alerts
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}