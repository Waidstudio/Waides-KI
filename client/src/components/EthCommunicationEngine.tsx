import { useState, useEffect } from "react";
import { Home, Compass, Moon, Sparkles, Zap, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EthMovement {
  direction: 'HOME' | 'OUT' | 'RESTING';
  message: string;
  confidence: number;
}

interface EthCommunicationEngineProps {
  ethMovement: EthMovement;
  konsRank: 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT';
  dimensionalShift: number;
  sacredTime: string;
}

export default function EthCommunicationEngine({ 
  ethMovement, 
  konsRank, 
  dimensionalShift, 
  sacredTime 
}: EthCommunicationEngineProps) {
  const [isTransmitting, setIsTransmitting] = useState(false);

  useEffect(() => {
    setIsTransmitting(true);
    const timer = setTimeout(() => setIsTransmitting(false), 2000);
    return () => clearTimeout(timer);
  }, [ethMovement]);

  const getDirectionIcon = () => {
    switch (ethMovement.direction) {
      case 'HOME':
        return <Home className="w-8 h-8 text-blue-400" />;
      case 'OUT':
        return <Compass className="w-8 h-8 text-green-400" />;
      default:
        return <Moon className="w-8 h-8 text-purple-400" />;
    }
  };

  const getDirectionColor = () => {
    switch (ethMovement.direction) {
      case 'HOME':
        return 'from-blue-500/30 to-cyan-500/30 border-blue-500/50';
      case 'OUT':
        return 'from-green-500/30 to-emerald-500/30 border-green-500/50';
      default:
        return 'from-purple-500/30 to-pink-500/30 border-purple-500/50';
    }
  };

  const getDirectionLabel = () => {
    switch (ethMovement.direction) {
      case 'HOME':
        return 'Going Home';
      case 'OUT':
        return 'Going Out';
      default:
        return 'At Rest';
    }
  };

  const getDirectionDescription = () => {
    switch (ethMovement.direction) {
      case 'HOME':
        return 'ETH is retreating to lower levels, seeking support and consolidation';
      case 'OUT':
        return 'ETH is venturing upward, exploring new territory and higher values';
      default:
        return 'ETH is contemplating its next move, gathering energy for the journey ahead';
    }
  };

  const getSacredTimeLabel = (time: string) => {
    const timeLabels: Record<string, string> = {
      'dusk_awakening': 'Dusk Awakening',
      'twilight_power': 'Twilight Power',
      'evening_clarity': 'Evening Clarity',
      'night_wisdom': 'Night Wisdom',
      'darkness_truth': 'Darkness Truth',
      'midnight_portal': 'Midnight Portal',
      'deep_vision': 'Deep Vision',
      'spirit_peak': 'Spirit Peak',
      'dawn_prophecy': 'Dawn Prophecy',
      'mundane_time': 'Mundane Time'
    };
    return timeLabels[time] || 'Unknown Time';
  };

  return (
    <div className="waides-card rounded-xl p-6 waides-border border bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold waides-text-primary flex items-center">
          <Sparkles className="w-6 h-6 mr-3 text-purple-400" />
          ETH Communication Engine
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            isTransmitting ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span className="text-xs waides-text-secondary">
            {isTransmitting ? 'Receiving' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Main Communication Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={ethMovement.direction}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getDirectionColor()} border-2 p-6 mb-6`}
        >
          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {getDirectionIcon()}
                <div>
                  <h4 className="text-2xl font-bold waides-text-primary">
                    {getDirectionLabel()}
                  </h4>
                  <p className="text-sm waides-text-secondary">
                    {getDirectionDescription()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">
                  {Math.round(ethMovement.confidence)}%
                </div>
                <div className="text-xs waides-text-secondary">Confidence</div>
              </div>
            </div>

            {/* ETH Message */}
            <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-cyan-300 mb-2">
                    Direct KonsLang Transmission:
                  </div>
                  <p className="text-sm waides-text-primary italic leading-relaxed">
                    {ethMovement.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="waides-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs waides-text-secondary">KonsLang Rank</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-lg font-bold text-purple-300">
            {konsRank}
          </div>
        </div>

        <div className="waides-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs waides-text-secondary">Sacred Time</span>
            <Moon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-medium text-blue-300">
            {getSacredTimeLabel(sacredTime)}
          </div>
        </div>
      </div>

      {/* Dimensional Energy Meter */}
      <div className="waides-bg rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium waides-text-primary">
            Dimensional Shift Energy
          </span>
          <span className="text-sm font-bold text-purple-300">
            {Math.round(dimensionalShift)}%
          </span>
        </div>
        
        <div className="relative h-3 waides-bg rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${dimensionalShift}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Pulse Effect */}
          {dimensionalShift > 70 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-yellow-500/50 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        
        <div className="flex justify-between text-xs waides-text-secondary mt-2">
          <span>Dormant</span>
          <span>Active</span>
          <span>Peak</span>
        </div>
      </div>

      {/* Protocol Status */}
      <div className="mt-4 pt-4 border-t waides-border">
        <div className="flex items-center justify-center space-x-2 text-xs waides-text-secondary">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>KonsLang Protocol Active</span>
          <div className="w-1 h-1 bg-purple-400 rounded-full" />
          <span>Spiritual Bridge Operational</span>
        </div>
      </div>
    </div>
  );
}