import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Activity, Wifi, WifiOff } from "lucide-react";

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

interface CandlestickResponse {
  symbol: string;
  interval: string;
  candlesticks: Candlestick[];
  count: number;
  wsConnected: boolean;
  timestamp: string;
}

interface LatestCandlestickResponse {
  symbol: string;
  interval: string;
  candlestick: Candlestick;
  wsConnected: boolean;
  timestamp: string;
}

interface CandlestickChartProps {
  symbol?: string;
  interval?: string;
  limit?: number;
}

export default function CandlestickChart({ 
  symbol = "ETHUSDT", 
  interval = "1m", 
  limit = 50 
}: CandlestickChartProps) {
  const { data: candlestickData, isLoading } = useQuery<CandlestickResponse>({
    queryKey: [`/api/candlesticks/${symbol}/${interval}`, { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/candlesticks/${symbol}/${interval}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch candlestick data');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: latestData } = useQuery<LatestCandlestickResponse>({
    queryKey: [`/api/candlesticks/${symbol}/${interval}/latest`],
    queryFn: async () => {
      const response = await fetch(`/api/candlesticks/${symbol}/${interval}/latest`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest candlestick');
      }
      return response.json();
    },
    refetchInterval: 1000, // Refresh every second for real-time data
  });

  if (isLoading) {
    return (
      <Card className="waides-card waides-border border animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg waides-text-primary flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Real-time Candlesticks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-48 bg-slate-800/50 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!candlestickData) {
    return (
      <Card className="waides-card waides-border border">
        <CardHeader>
          <CardTitle className="text-lg waides-text-primary flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Real-time Candlesticks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400 py-8">
            No candlestick data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const latest = latestData?.candlestick || candlestickData.candlesticks[0];
  const previous = candlestickData.candlesticks[1];
  const priceChange = latest && previous ? latest.close - previous.close : 0;
  const priceChangePercent = previous ? (priceChange / previous.close) * 100 : 0;

  const formatPrice = (price: number) => `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  return (
    <Card className="waides-card waides-border border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg waides-text-primary flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Real-time Candlesticks</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {symbol} • {interval}
            </Badge>
            <div className="flex items-center space-x-1">
              {candlestickData.wsConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-xs ${candlestickData.wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                {candlestickData.wsConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Price Display */}
        {latest && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm waides-text-secondary">Current Price</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold waides-text-primary">
                  {formatPrice(latest.close)}
                </span>
                <div className={`flex items-center space-x-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm waides-text-secondary">Volume</div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-lg font-semibold text-blue-400">
                  {formatVolume(latest.volume)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* OHLC Data */}
        {latest && (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs waides-text-secondary">Open</div>
              <div className="text-sm font-medium waides-text-primary">
                {formatPrice(latest.open)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs waides-text-secondary">High</div>
              <div className="text-sm font-medium text-green-400">
                {formatPrice(latest.high)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs waides-text-secondary">Low</div>
              <div className="text-sm font-medium text-red-400">
                {formatPrice(latest.low)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs waides-text-secondary">Close</div>
              <div className="text-sm font-medium waides-text-primary">
                {formatPrice(latest.close)}
              </div>
            </div>
          </div>
        )}

        {/* Simple Candlestick Visualization */}
        <div className="space-y-2">
          <div className="text-sm waides-text-secondary">Recent Candlesticks (Last 10)</div>
          <div className="flex space-x-1 h-24 items-end">
            {candlestickData.candlesticks.slice(0, 10).reverse().map((candle, index) => {
              const isGreen = candle.close >= candle.open;
              const bodyHeight = Math.abs(candle.close - candle.open);
              const maxPrice = Math.max(...candlestickData.candlesticks.slice(0, 10).map(c => c.high));
              const minPrice = Math.min(...candlestickData.candlesticks.slice(0, 10).map(c => c.low));
              const priceRange = maxPrice - minPrice;
              const height = ((bodyHeight / priceRange) * 80) + 4; // Minimum 4px height
              
              return (
                <div key={`${candle.openTime}-${index}`} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-sm ${
                      isGreen ? 'bg-green-500' : 'bg-red-500'
                    } opacity-80 hover:opacity-100 transition-opacity`}
                    style={{ height: `${Math.max(height, 4)}px` }}
                    title={`O: ${formatPrice(candle.open)} H: ${formatPrice(candle.high)} L: ${formatPrice(candle.low)} C: ${formatPrice(candle.close)}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Statistics */}
        <div className="flex items-center justify-between text-xs waides-text-secondary border-t border-slate-700/50 pt-4">
          <span>
            {candlestickData.count} candlesticks loaded
          </span>
          <span>
            Updated: {new Date(candlestickData.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}