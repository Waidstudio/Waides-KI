import { ArrowUp, ArrowDown, Minus, Target, StopCircle } from "lucide-react";

interface Signal {
  type: 'LONG' | 'SHORT' | 'HOLD';
  confidence: number;
  entryPoint: number;
  targetPrice: number;
  stopLoss: number;
  description: string;
  konsMessage: string;
}

interface SignalCardProps {
  signal?: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  if (!signal) {
    return (
      <div className="waides-card rounded-xl p-6 waides-border border">
        <div className="text-center py-8">
          <div className="text-sm waides-text-secondary">Loading signal data...</div>
        </div>
      </div>
    );
  }

  const getSignalIcon = () => {
    switch (signal.type) {
      case 'LONG':
        return <ArrowUp className="text-green-500 text-xl" />;
      case 'SHORT':
        return <ArrowDown className="text-red-500 text-xl" />;
      default:
        return <Minus className="text-yellow-500 text-xl" />;
    }
  };

  const getSignalColor = () => {
    switch (signal.type) {
      case 'LONG':
        return 'border-green-500/50 waides-glow-green';
      case 'SHORT':
        return 'border-red-500/50 waides-glow-red';
      default:
        return 'border-yellow-500/50 waides-glow-yellow';
    }
  };

  const getSignalBadgeColor = () => {
    switch (signal.type) {
      case 'LONG':
        return 'bg-green-500/20 text-green-500';
      case 'SHORT':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  const getTargetColor = () => {
    switch (signal.type) {
      case 'LONG':
        return 'text-green-500';
      case 'SHORT':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className={`waides-card rounded-xl p-6 border ${getSignalColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold waides-text-primary">Current Signal</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalBadgeColor()}`}>
          {signal.type}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          {getSignalIcon()}
          <div>
            <div className="font-semibold waides-text-primary">{signal.description}</div>
            <div className="text-sm waides-text-secondary">
              Confidence: {Math.round(signal.confidence)}%
            </div>
          </div>
        </div>
        
        <div className="waides-bg rounded-lg p-3">
          <div className="text-sm waides-text-secondary mb-1">Entry Point</div>
          <div className={`font-semibold ${getTargetColor()}`}>
            {formatPrice(signal.entryPoint)}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1 waides-bg rounded-lg p-3">
            <div className="text-xs waides-text-secondary flex items-center">
              <Target className="w-3 h-3 mr-1" />
              Target
            </div>
            <div className={`font-semibold ${getTargetColor()}`}>
              {formatPrice(signal.targetPrice)}
            </div>
          </div>
          <div className="flex-1 waides-bg rounded-lg p-3">
            <div className="text-xs waides-text-secondary flex items-center">
              <StopCircle className="w-3 h-3 mr-1" />
              Stop Loss
            </div>
            <div className="font-semibold text-red-500">
              {formatPrice(signal.stopLoss)}
            </div>
          </div>
        </div>

        {/* Kons Message */}
        {signal.konsMessage && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
            <div className="text-xs font-semibold text-purple-300 mb-1">
              Kons Powa Speaks:
            </div>
            <p className="text-xs waides-text-secondary italic">
              "{signal.konsMessage}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
