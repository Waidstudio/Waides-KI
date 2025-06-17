import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingUp } from "lucide-react";

interface EthDataPoint {
  id: number;
  price: number;
  volume?: number;
  marketCap?: number;
  priceChange24h?: number;
  timestamp: string;
}

export default function PriceChart() {
  const { data: history, isLoading } = useQuery<EthDataPoint[]>({
    queryKey: ['/api/eth/history'],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="waides-card rounded-xl p-6 waides-border border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold waides-text-primary">ETH/USD Chart</h3>
        </div>
        <div className="h-64 waides-bg rounded-lg flex items-center justify-center">
          <div className="text-sm waides-text-secondary">Loading chart data...</div>
        </div>
      </div>
    );
  }

  const maxPrice = Math.max(...(history?.map(d => d.price) || [2500]));
  const minPrice = Math.min(...(history?.map(d => d.price) || [2400]));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="waides-card rounded-xl p-6 waides-border border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold waides-text-primary flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          ETH/USD Chart
        </h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-green-500/20 text-green-500 rounded">1H</button>
          <button className="px-3 py-1 text-xs waides-text-secondary hover:waides-text-primary">4H</button>
          <button className="px-3 py-1 text-xs waides-text-secondary hover:waides-text-primary">1D</button>
        </div>
      </div>
      
      <div className="h-64 waides-bg rounded-lg flex items-center justify-center relative overflow-hidden">
        {history && history.length > 0 ? (
          <>
            <div className="absolute inset-4 flex items-end justify-between">
              {history.slice(-20).map((dataPoint, index) => {
                const heightPercent = ((dataPoint.price - minPrice) / priceRange) * 80 + 10;
                const isPositive = index === 0 || dataPoint.price >= history[index - 1]?.price;
                
                return (
                  <div key={dataPoint.id} className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-2 rounded-sm ${
                        isPositive ? 'bg-green-500/60' : 'bg-red-500/60'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`$${dataPoint.price.toFixed(2)} at ${new Date(dataPoint.timestamp).toLocaleTimeString()}`}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="absolute top-4 left-4 text-xs waides-text-secondary">
              <div>High: ${maxPrice.toFixed(2)}</div>
              <div>Low: ${minPrice.toFixed(2)}</div>
            </div>
            
            <div className="absolute bottom-4 right-4 text-xs waides-text-secondary flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Real-time data
            </div>
          </>
        ) : (
          <div className="text-sm waides-text-secondary">
            No chart data available. Start collecting price data to see the chart.
          </div>
        )}
      </div>
    </div>
  );
}
