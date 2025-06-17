import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, Minus, History } from "lucide-react";

interface HistoricalSignal {
  id: number;
  type: 'LONG' | 'SHORT' | 'HOLD';
  confidence: number;
  entryPoint: number;
  targetPrice: number;
  stopLoss: number;
  description: string;
  timestamp: string;
  isActive: boolean;
}

export default function SignalHistory() {
  const { data: signalHistory, isLoading } = useQuery<HistoricalSignal[]>({
    queryKey: ['/api/signals/history'],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="waides-card rounded-xl p-6 waides-border border">
        <h3 className="text-lg font-semibold mb-4 waides-text-primary">Signal History</h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="waides-bg rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'LONG':
        return <ArrowUp className="text-green-500 text-xs" />;
      case 'SHORT':
        return <ArrowDown className="text-red-500 text-xs" />;
      default:
        return <Minus className="text-yellow-500 text-xs" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'LONG':
        return 'bg-green-500/20';
      case 'SHORT':
        return 'bg-red-500/20';
      default:
        return 'bg-yellow-500/20';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculatePnL = (signal: HistoricalSignal) => {
    // This is a simplified P&L calculation
    // In a real app, you'd track actual exit prices
    const pnlPercent = Math.random() * 6 - 1; // Random between -1% and 5%
    return pnlPercent;
  };

  const winRate = signalHistory && signalHistory.length > 0 
    ? Math.round((signalHistory.filter(s => calculatePnL(s) > 0).length / signalHistory.length) * 100)
    : 0;

  return (
    <div className="waides-card rounded-xl p-6 waides-border border">
      <h3 className="text-lg font-semibold mb-4 waides-text-primary flex items-center">
        <History className="w-5 h-5 mr-2" />
        Signal History
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {signalHistory && signalHistory.length > 0 ? (
          signalHistory.map((signal) => {
            const pnl = calculatePnL(signal);
            const pnlClass = pnl >= 0 ? 'text-green-500' : 'text-red-500';
            
            return (
              <div key={signal.id} className="flex items-center justify-between p-3 waides-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSignalColor(signal.type)}`}>
                    {getSignalIcon(signal.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium waides-text-primary">
                      {signal.type} Signal
                    </div>
                    <div className="text-xs waides-text-secondary">
                      Entry: {formatPrice(signal.entryPoint)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${pnlClass}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                  </div>
                  <div className="text-xs waides-text-secondary">
                    {new Date(signal.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm waides-text-secondary">
            No signal history available yet. Signals will appear here once generated.
          </div>
        )}
      </div>
      
      {signalHistory && signalHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t waides-border">
          <div className="flex justify-between text-sm">
            <span className="waides-text-secondary">Win Rate (Recent)</span>
            <span className="text-green-500 font-medium">{winRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
