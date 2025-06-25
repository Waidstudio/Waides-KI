import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function LiveDataPage() {
  const { data: liveData } = useQuery<{
    price: number;
    ema50: number;
    ema200: number;
    vwap: number;
    rsi: number;
    volume: number;
    trend: string;
    vwap_status: string;
    timestamp: number;
    source: string;
  }>({
    queryKey: ['/api/waides-ki/live-data'],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const { data: marketSummary } = useQuery<{
    currentPrice: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    lastUpdate: string;
    isLive: boolean;
  }>({
    queryKey: ['/api/eth/market-summary'],
    refetchInterval: 5000,
  });

  const { data: tradingActivity } = useQuery<{
    tradesLastMinute: number;
    tradesLast5Minutes: number;
    avgVolumeLastMinute: number;
    priceVolatility: number;
  }>({
    queryKey: ['/api/eth/trading-activity'],
    refetchInterval: 5000,
  });

  const { data: streamStatus } = useQuery<{
    isLive: boolean;
    source: string;
    lastUpdate: number;
    dataAge: number;
    fallbackMode: boolean;
    quality: string;
  }>({
    queryKey: ['/api/waides-ki/data-stream-status'],
    refetchInterval: 5000,
  });

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UPTREND': return 'text-green-400';
      case 'DOWNTREND': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'EXCELLENT': return 'bg-green-500';
      case 'GOOD': return 'bg-blue-500';
      case 'POOR': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Live Market Data</h1>
          <p className="text-slate-400 mt-2">Real-time ETH tracking and market analysis</p>
        </div>
        {streamStatus?.isLive && (
          <Badge variant="outline" className="border-green-500 text-green-400">
            ● LIVE
          </Badge>
        )}
      </div>

      {/* Data Source Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Data Stream Status</CardTitle>
          <CardDescription>Real-time connection monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-100">
                {streamStatus?.isLive ? 'CONNECTED' : 'OFFLINE'}
              </div>
              <div className="text-xs text-slate-400">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {streamStatus?.source || 'N/A'}
              </div>
              <div className="text-xs text-slate-400">Source</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getQualityColor(streamStatus?.quality || 'UNKNOWN').replace('bg-', 'text-')}`}>
                {streamStatus?.quality || 'UNKNOWN'}
              </div>
              <div className="text-xs text-slate-400">Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-100">
                {streamStatus?.dataAge ? Math.round(streamStatus.dataAge / 1000) : 0}s
              </div>
              <div className="text-xs text-slate-400">Age</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Price Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-100">ETH Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              ${liveData?.price?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {liveData?.source || 'No data'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-100">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(marketSummary?.priceChangePercent24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(marketSummary?.priceChangePercent24h || 0).toFixed(2)}%
            </div>
            <div className="text-sm text-slate-400 mt-1">
              ${(marketSummary?.priceChange24h || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-100">Volume 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {(marketSummary?.volume24h || 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              ETH traded
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-100">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTrendColor(liveData?.trend || 'RANGING')}`}>
              {liveData?.trend || 'RANGING'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {liveData?.vwap_status || 'UNKNOWN'} VWAP
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Indicators */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Technical Indicators</CardTitle>
          <CardDescription>Real-time market analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">RSI</span>
                <span className="text-sm font-medium text-slate-100">
                  {liveData?.rsi?.toFixed(1) || '50.0'}
                </span>
              </div>
              <Progress 
                value={liveData?.rsi || 50} 
                className="h-2" 
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Oversold</span>
                <span>Overbought</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">EMA 50</div>
              <div className="text-xl font-bold text-blue-400">
                ${liveData?.ema50?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">EMA 200</div>
              <div className="text-xl font-bold text-purple-400">
                ${liveData?.ema200?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-2">VWAP</div>
              <div className="text-xl font-bold text-orange-400">
                ${liveData?.vwap?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Trading Activity</CardTitle>
          <CardDescription>Real-time market activity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {tradingActivity?.tradesLastMinute || 0}
              </div>
              <div className="text-sm text-slate-400">Trades / Minute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {tradingActivity?.tradesLast5Minutes || 0}
              </div>
              <div className="text-sm text-slate-400">Trades / 5 Min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {(tradingActivity?.avgVolumeLastMinute || 0).toFixed(3)}
              </div>
              <div className="text-sm text-slate-400">Avg Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {(tradingActivity?.priceVolatility || 0).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Volatility</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Range */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">24h Range</CardTitle>
          <CardDescription>High and low prices in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-1">24h High</div>
              <div className="text-2xl font-bold text-green-400">
                ${marketSummary?.high24h?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">24h Low</div>
              <div className="text-2xl font-bold text-red-400">
                ${marketSummary?.low24h?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}