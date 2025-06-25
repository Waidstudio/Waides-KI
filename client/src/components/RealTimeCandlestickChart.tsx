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
  tradingView: {
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
  interval = "1m", 
  limit = 50
}: RealTimeCandlestickChartProps) {
  const [selectedSource, setSelectedSource] = useState<'binance' | 'tradingview'>('binance');

  // Fetch candlestick data
  const { data: candlestickData, isLoading: candlestickLoading, refetch: refetchCandlesticks } = useQuery({
    queryKey: ['/api/candlesticks', symbol, interval, limit],
    queryFn: () => fetch(`/api/candlesticks/${symbol}/${interval}?limit=${limit}`).then(res => res.json()),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Fetch WebSocket status
  const { data: wsStatus, isLoading: wsLoading } = useQuery<WebSocketStatus>({
    queryKey: ['/api/websocket/status'],
    queryFn: () => fetch('/api/websocket/status').then(res => res.json()),
    refetchInterval: 10000 // Check status every 10 seconds
  });

  // Get latest candlestick
  const { data: latestCandlestick } = useQuery({
    queryKey: ['/api/candlesticks/latest', symbol, interval],
    queryFn: () => fetch(`/api/candlesticks/${symbol}/${interval}/latest`).then(res => res.json()),
    refetchInterval: 2000 // Update every 2 seconds
  });

  const candlesticks = candlestickData?.candlesticks || [];
  const latest = latestCandlestick?.candlestick || candlesticks[candlesticks.length - 1];

  // Calculate price change
  const priceChange = latest && candlesticks.length > 1 ? 
    ((latest.close - candlesticks[0].open) / candlesticks[0].open) * 100 : 0;

  // Get connection status for selected source
  const connectionStatus = selectedSource === 'binance' ? wsStatus?.binance : wsStatus?.tradingView;

  return (
    <div className="space-y-4">
      {/* Real-time Data Source Selector */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Real-Time Candlestick Data
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={selectedSource} onValueChange={(value: 'binance' | 'tradingview') => setSelectedSource(value)}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="binance">Binance WebSocket</SelectItem>
                  <SelectItem value="tradingview">TradingView WebSocket</SelectItem>
                </SelectContent>
              </Select>
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
                {selectedSource === 'binance' ? 'Binance Global' : 'TradingView'}
              </div>
            </div>

            {/* Symbol & Interval */}
            <div className="text-sm">
              <div className="text-slate-400">Symbol/Interval</div>
              <div className="text-white font-medium">
                {connectionStatus?.symbol || symbol} / {connectionStatus?.interval || interval}
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
                {candlesticks.slice(-20).map((candle, index) => {
                  const isGreen = candle.close > candle.open;
                  const bodyHeight = Math.abs(candle.close - candle.open);
                  const maxRange = Math.max(...candlesticks.slice(-20).map(c => c.high - c.low));
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