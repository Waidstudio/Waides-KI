import { TrendingUp, Clock, DollarSign, BarChart3, Wifi } from "lucide-react";
import { useEthPrice } from "@/hooks/useKonsMesh";

interface EthData {
  price: number;
  volume?: number;
  marketCap?: number;
  priceChange24h?: number;
  fearGreedIndex?: number;
  timestamp: number;
}

interface PriceOverviewProps {
  ethData?: EthData;
}

export default function PriceOverview({ ethData }: PriceOverviewProps) {
  // Use KonsMesh for real-time ETH price
  const ethPrice = useEthPrice();
  
  // Use KonsMesh data if available, otherwise fallback to props
  const currentEthData = ethPrice.price > 0 ? {
    price: ethPrice.price,
    volume: ethPrice.volume,
    marketCap: ethPrice.marketCap,
    priceChange24h: ethPrice.priceChange24h,
    timestamp: ethPrice.timestamp
  } : ethData;
  
  if (!currentEthData) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const getFearGreedLabel = (index: number) => {
    if (index >= 75) return "Extreme Greed";
    if (index >= 55) return "Greed";
    if (index >= 45) return "Neutral";
    if (index >= 25) return "Fear";
    return "Extreme Fear";
  };

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return "text-red-500";
    if (index >= 55) return "text-yellow-500";
    if (index >= 45) return "text-blue-500";
    if (index >= 25) return "text-orange-500";
    return "text-red-600";
  };

  const priceChangeClass = (currentEthData.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500";
  const priceChangeIcon = (currentEthData.priceChange24h || 0) >= 0 ? "+" : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-2 waides-card rounded-xl p-6 waides-border border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold waides-text-primary">Ethereum (ETH)</h3>
            {ethPrice.isConnected && (
              <div className="flex items-center space-x-1">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">Live</span>
              </div>
            )}
            {ethPrice.isStale && (
              <span className="text-xs text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
                Stale
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm waides-text-secondary">
            <Clock className="w-4 h-4" />
            <span>{new Date(currentEthData.timestamp).toLocaleTimeString()} UTC</span>
          </div>
        </div>
        
        <div className="flex items-end space-x-4">
          <div>
            <div className="text-3xl font-bold waides-text-primary">
              {formatPrice(currentEthData.price)}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm font-medium ${priceChangeClass}`}>
                {priceChangeIcon}{currentEthData.priceChange24h?.toFixed(2)}%
              </span>
              <span className="text-sm waides-text-secondary">
                {priceChangeIcon}{formatPrice(Math.abs((currentEthData.priceChange24h || 0) * currentEthData.price / 100))}
              </span>
            </div>
          </div>
          
          {/* Mini Chart Placeholder */}
          <div className="flex-1 h-16 relative">
            <div className="absolute inset-0 flex items-end justify-between space-x-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-sm ${
                    Math.random() > 0.5 ? 'bg-green-500/60' : 'bg-red-500/60'
                  }`}
                  style={{ height: `${Math.random() * 100 + 20}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Volume & Market Data */}
      <div className="waides-card rounded-xl p-6 waides-border border">
        <h4 className="text-sm font-medium waides-text-secondary mb-4 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          24h Volume
        </h4>
        <div className="text-2xl font-bold waides-text-primary">
          {currentEthData.volume ? formatVolume(currentEthData.volume) : 'N/A'}
        </div>
        
        <div className="mt-4 pt-4 border-t waides-border">
          <div className="flex justify-between text-sm">
            <span className="waides-text-secondary">Market Cap</span>
            <span className="waides-text-primary">
              {currentEthData.marketCap ? formatMarketCap(currentEthData.marketCap) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Fear & Greed Index */}
      <div className="waides-card rounded-xl p-6 waides-border border">
        <h4 className="text-sm font-medium waides-text-secondary mb-4">Fear & Greed</h4>
        <div className={`text-2xl font-bold ${getFearGreedColor(ethData.fearGreedIndex || 50)}`}>
          {ethData.fearGreedIndex || 50}
        </div>
        <div className="text-sm waides-text-secondary mt-1">
          {getFearGreedLabel(ethData.fearGreedIndex || 50)}
        </div>
        
        <div className="mt-4">
          <div className="w-full waides-bg rounded-full h-2">
            <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full relative">
              <div 
                className="absolute top-0 w-1 h-2 bg-white rounded-full"
                style={{ left: `${(ethData.fearGreedIndex || 50)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
