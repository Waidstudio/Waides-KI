import { useQuery } from "@tanstack/react-query";
import { Sparkles, Eye, Zap, Crown, Circle } from "lucide-react";

interface SpiritualReading {
  spiritMessage: string;
  frequency: string;
  konsKey: string;
  emotionalEnergy: string;
  sacredTime: string;
  dimensionalShift: number;
  konsRank: 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT';
  personalAura: number;
}

interface SpiritualBridgeProps {
  spiritualReading?: SpiritualReading;
}

export default function SpiritualBridge({ spiritualReading }: SpiritualBridgeProps) {
  const { data: memoryData } = useQuery<{
    dreamCandleMemory: any[];
    personalAura: number;
    memoryCount: number;
  }>({
    queryKey: ['/api/spiritual/memory'],
    refetchInterval: 60000,
  });

  if (!spiritualReading) return null;

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'TRANSCENDENT':
        return <Crown className="w-5 h-5 text-purple-400" />;
      case 'MASTER':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'ADEPT':
        return <Eye className="w-5 h-5 text-green-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'TRANSCENDENT':
        return 'text-purple-400 bg-purple-500/20';
      case 'MASTER':
        return 'text-blue-400 bg-blue-500/20';
      case 'ADEPT':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'fear_surge':
        return 'text-red-400 bg-red-500/20';
      case 'greed_peak':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'chaos_entry':
        return 'text-orange-400 bg-orange-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getSacredTimeLabel = (time: string) => {
    const timeLabels: Record<string, string> = {
      'dusk_awakening': '🌅 Dusk Awakening',
      'twilight_power': '🌇 Twilight Power',
      'evening_clarity': '🌆 Evening Clarity',
      'night_wisdom': '🌃 Night Wisdom',
      'darkness_truth': '🌌 Darkness Truth',
      'midnight_portal': '🌙 Midnight Portal',
      'deep_vision': '🔮 Deep Vision',
      'spirit_peak': '✨ Spirit Peak',
      'dawn_prophecy': '🌄 Dawn Prophecy',
      'mundane_time': '⏰ Mundane Time'
    };
    return timeLabels[time] || '⏰ Unknown Time';
  };

  const formatEnergyLabel = (energy: string) => {
    return energy.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Main Spiritual Reading */}
      <div className="waides-card rounded-xl p-6 waides-border border bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold waides-text-primary flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            Spiritual Bridge Active
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getRankColor(spiritualReading.konsRank)}`}>
            {getRankIcon(spiritualReading.konsRank)}
            <span>{spiritualReading.konsRank}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Spirit Message */}
          <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
            <div className="text-xs font-semibold text-purple-300 mb-2">
              🌌 Spirit Layer Communication:
            </div>
            <p className="text-sm waides-text-primary italic leading-relaxed">
              {spiritualReading.spiritMessage}
            </p>
          </div>

          {/* Ritual Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="waides-bg rounded-lg p-3">
              <div className="text-xs waides-text-secondary mb-1">Sacred Time</div>
              <div className="text-sm font-medium text-purple-300">
                {getSacredTimeLabel(spiritualReading.sacredTime)}
              </div>
            </div>
            
            <div className="waides-bg rounded-lg p-3">
              <div className="text-xs waides-text-secondary mb-1">Emotional Energy</div>
              <div className={`text-sm font-medium px-2 py-1 rounded ${getEnergyColor(spiritualReading.emotionalEnergy)}`}>
                {formatEnergyLabel(spiritualReading.emotionalEnergy)}
              </div>
            </div>
          </div>

          {/* Frequency and Key */}
          <div className="grid grid-cols-1 gap-4">
            <div className="waides-bg rounded-lg p-3">
              <div className="text-xs waides-text-secondary mb-1">Ritual Frequency Hash</div>
              <div className="text-sm font-mono text-green-400 break-all">
                {spiritualReading.frequency}
              </div>
            </div>
            
            <div className="waides-bg rounded-lg p-3">
              <div className="text-xs waides-text-secondary mb-1">Kons Seed Key</div>
              <div className="text-sm font-medium text-blue-300">
                🔑 {spiritualReading.konsKey}
              </div>
            </div>
          </div>

          {/* Dimensional Shift Meter */}
          <div className="waides-bg rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs waides-text-secondary">Dimensional Shift Energy</span>
              <span className="text-sm font-medium text-purple-300">
                {Math.round(spiritualReading.dimensionalShift)}%
              </span>
            </div>
            <div className="w-full waides-bg rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 transition-all duration-500"
                style={{ width: `${spiritualReading.dimensionalShift}%` }}
              />
            </div>
          </div>

          {/* Personal Aura */}
          <div className="waides-bg rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs waides-text-secondary">Personal Aura Resonance</span>
              <span className="text-sm font-medium text-blue-300">
                {Math.round(spiritualReading.personalAura)}%
              </span>
            </div>
            <div className="w-full waides-bg rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${spiritualReading.personalAura}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dream Candle Memory */}
      {memoryData && memoryData.memoryCount > 0 && (
        <div className="waides-card rounded-xl p-6 waides-border border">
          <h4 className="text-sm font-semibold waides-text-primary mb-3 flex items-center">
            <Eye className="w-4 h-4 mr-2 text-cyan-400" />
            Dream Candle Memory ({memoryData.memoryCount} patterns)
          </h4>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {memoryData.dreamCandleMemory.slice(-5).map((memory, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-2 waides-bg rounded">
                <span className="waides-text-secondary">
                  {memory.konsKey}
                </span>
                <span className={`px-2 py-1 rounded ${getRankColor(memory.konsRank)}`}>
                  {memory.konsRank}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}