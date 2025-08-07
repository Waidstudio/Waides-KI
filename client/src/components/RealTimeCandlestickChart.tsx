import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, Activity, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

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

interface WebSocketStatus {
  binance: {
    connected: boolean;
    symbol: string;
    interval: string;
  };
}

interface RealTimeCandlestickChartProps {
  symbol?: string;
  interval?: string;
  limit?: number;
}

export default function RealTimeCandlestickChart({ 
  symbol = "ETHUSDT", 
  interval: defaultInterval = "1m", 
  limit = 50
}: RealTimeCandlestickChartProps) {
  const [selectedInterval, setSelectedInterval] = useState(defaultInterval);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);

  // Available timeframes
  const timeframes = [
    { value: "1m", label: "1 Minute" },
    { value: "5m", label: "5 Minutes" },
    { value: "15m", label: "15 Minutes" },
    { value: "30m", label: "30 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1d", label: "1 Day" }
  ];

  // Available symbols
  const symbols = [
    { value: "ETHUSDT", label: "ETH/USDT" },
    { value: "BTCUSDT", label: "BTC/USDT" },
    { value: "ADAUSDT", label: "ADA/USDT" },
    { value: "DOTUSDT", label: "DOT/USDT" },
    { value: "SOLUSDT", label: "SOL/USDT" }
  ];

  // Fetch candlestick data with optimized refresh intervals
  const { data: candlestickData, isLoading: candlestickLoading, refetch: refetchCandlesticks } = useQuery({
    queryKey: ['/api/candlesticks', selectedSymbol, selectedInterval, limit],
    queryFn: () => fetch(`/api/candlesticks/${selectedSymbol}/${selectedInterval}?limit=${limit}`).then(res => res.json()),
    refetchInterval: selectedInterval === "1m" ? 15000 : selectedInterval === "5m" ? 30000 : 60000, // Slower refresh for stability
    staleTime: 10000, // Data considered fresh for 10 seconds
    gcTime: 30000 // Keep in cache for 30 seconds
  });

  // Fetch WebSocket status with reduced frequency
  const { data: wsStatus, isLoading: wsLoading } = useQuery<WebSocketStatus>({
    queryKey: ['/api/websocket/status'],
    queryFn: () => fetch('/api/websocket/status').then(res => res.json()),
    refetchInterval: 10000 // Check status every 10 seconds
  });

  // Get latest candlestick
  const { data: latestCandlestick } = useQuery({
    queryKey: ['/api/candlesticks/latest', selectedSymbol, selectedInterval],
    queryFn: () => fetch(`/api/candlesticks/${selectedSymbol}/${selectedInterval}/latest`).then(res => res.json()),
    refetchInterval: selectedInterval === "1m" ? 2000 : selectedInterval === "5m" ? 10000 : 30000 // Update based on timeframe
  });

  const candlesticks = candlestickData?.candlesticks || [];
  const latest = latestCandlestick?.candlestick || candlesticks[candlesticks.length - 1];

  // Calculate price change
  const priceChange = latest && candlesticks.length > 1 ? 
    ((latest.close - candlesticks[0].open) / candlesticks[0].open) * 100 : 0;

  // Get Binance connection status
  const connectionStatus = wsStatus?.binance;

  return (
    <div className="space-y-4">
      {/* Real-time Data Source Selector */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Real-Time Candlestick Data
              </CardTitle>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  Binance WebSocket
                </Badge>
                <Button
                  onClick={() => refetchCandlesticks()}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Timeframe and Symbol Selectors */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Symbol:</span>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {symbols.map(sym => (
                      <SelectItem key={sym.value} value={sym.value} className="text-slate-200">
                        {sym.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Timeframe:</span>
                <Select value={selectedInterval} onValueChange={setSelectedInterval}>
                  <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {timeframes.map(tf => (
                      <SelectItem key={tf.value} value={tf.value} className="text-slate-200">
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Badge variant="outline" className="border-green-500 text-green-400">
                {timeframes.find(tf => tf.value === selectedInterval)?.label || selectedInterval}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connectionStatus?.connected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <Badge variant="outline" className="border-red-500 text-red-400">
                    Disconnected
                  </Badge>
                </>
              )}
            </div>

            {/* Data Source Info */}
            <div className="text-sm">
              <div className="text-slate-400">Source</div>
              <div className="text-white font-medium">
                Binance Global
              </div>
            </div>

            {/* Symbol & Interval */}
            <div className="text-sm">
              <div className="text-slate-400">Symbol/Interval</div>
              <div className="text-white font-medium">
                {connectionStatus?.symbol || selectedSymbol} / {connectionStatus?.interval || selectedInterval}
              </div>
            </div>

            {/* Total Candlesticks */}
            <div className="text-sm">
              <div className="text-slate-400">Data Points</div>
              <div className="text-white font-medium">
                {candlesticks.length} candlesticks
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Price & OHLC Data */}
      {latest && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-400" />
                ${latest.close.toFixed(2)}
              </div>
              <div className={`flex items-center text-lg ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-400 uppercase">Open</div>
                <div className="text-lg font-semibold text-blue-400">${latest.open.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-400 uppercase">High</div>
                <div className="text-lg font-semibold text-green-400">${latest.high.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-400 uppercase">Low</div>
                <div className="text-lg font-semibold text-red-400">${latest.low.toFixed(2)}</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-400 uppercase">Volume</div>
                <div className="text-lg font-semibold text-purple-400">
                  {(latest.volume / 1000).toFixed(1)}K
                </div>
              </div>
            </div>

            {/* Candlestick Timeline */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Candlesticks</h4>
              <div className="flex space-x-1 overflow-x-auto pb-2">
                {candlesticks.slice(-20).map((candle: Candlestick, index: number) => {
                  const isGreen = candle.close > candle.open;
                  const bodyHeight = Math.abs(candle.close - candle.open);
                  const maxRange = Math.max(...candlesticks.slice(-20).map((c: Candlestick) => c.high - c.low));
                  const normalizedHeight = Math.max((bodyHeight / maxRange) * 40, 2);
                  
                  return (
                    <div
                      key={candle.id || index}
                      className="flex flex-col items-center min-w-[16px] group relative"
                    >
                      {/* Wick */}
                      <div 
                        className={`w-0.5 ${isGreen ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ height: '2px' }}
                      />
                      {/* Body */}
                      <div
                        className={`w-3 ${isGreen ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                        style={{ height: `${normalizedHeight}px` }}
                      />
                      {/* Wick */}
                      <div 
                        className={`w-0.5 ${isGreen ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ height: '2px' }}
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                        <div className="text-slate-200">
                          O: ${candle.open.toFixed(2)}<br />
                          H: ${candle.high.toFixed(2)}<br />
                          L: ${candle.low.toFixed(2)}<br />
                          C: ${candle.close.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(candlestickLoading || wsLoading) && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-slate-400">Loading real-time candlestick data...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}