import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Users, Mic, Activity, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VoicePersona {
  id: string;
  name: string;
  voiceProfile: {
    pitch: number;
    speed: number;
    tone: string;
    accent: string;
  };
  personality: string;
  specialization: string[];
  narrativeStyle: string;
}

interface LiveNarration {
  id: string;
  personaId: string;
  content: string;
  timestamp: string;
  marketContext: {
    ethPrice: number;
    priceChange: number;
    trend: string;
    volume: number;
  };
  botActivity: {
    waidBot: string;
    waidBotPro: string;
    autonomousTrader: string;
    fullEngine: string;
  };
  audioData?: {
    duration: number;
    waveform: number[];
    voiceId: string;
  };
}

interface VoiceNarrationControlsProps {
  className?: string;
}

export default function VoiceNarrationControls({ className = '' }: VoiceNarrationControlsProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<string>('konsai');
  const [volume, setVolume] = useState(75);
  const [autoNarration, setAutoNarration] = useState(true);
  const queryClient = useQueryClient();

  // Fetch current narration
  const { data: currentNarration, isLoading: narrationLoading } = useQuery({
    queryKey: ['/api/voice-narration/current'],
    refetchInterval: 2000, // Poll every 2 seconds for live updates
  });

  // Fetch narration queue
  const { data: narrationQueue } = useQuery({
    queryKey: ['/api/voice-narration/queue'],
    refetchInterval: 3000,
  });

  // Fetch available personas
  const { data: personasData } = useQuery({
    queryKey: ['/api/market-storytelling/personas'],
  });

  // Request specific persona narration
  const requestNarrationMutation = useMutation({
    mutationFn: (personaId: string) => 
      apiRequest(`/api/voice-narration/request/${personaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice-narration/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/voice-narration/queue'] });
    },
  });

  // Generate immediate narration
  const generateNarrationMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/voice-narration/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voice-narration/current'] });
    },
  });

  // Toggle persona active status
  const togglePersonaMutation = useMutation({
    mutationFn: ({ personaId, active }: { personaId: string; active: boolean }) =>
      apiRequest(`/api/voice-narration/personas/${personaId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/market-storytelling/personas'] });
    },
  });

  const personas = personasData?.personas || [];
  const currentNarrationData = currentNarration?.narration as LiveNarration | null;
  const queueData = narrationQueue?.queue || [];

  const handleRequestNarration = (personaId: string) => {
    if (!requestNarrationMutation.isPending) {
      requestNarrationMutation.mutate(personaId);
    }
  };

  const handleGenerateNarration = () => {
    if (!generateNarrationMutation.isPending) {
      generateNarrationMutation.mutate();
    }
  };

  const getPersonaIcon = (personaId: string) => {
    const icons = {
      konsai: '🔮',
      sage_trader: '🧙‍♂️',
      data_scientist: '📊',
      street_trader: '⚡',
      zen_master: '🧘‍♂️'
    };
    return icons[personaId as keyof typeof icons] || '🎭';
  };

  const getPersonaColor = (personaId: string) => {
    const colors = {
      konsai: 'from-purple-500 to-indigo-600',
      sage_trader: 'from-amber-500 to-orange-600',
      data_scientist: 'from-blue-500 to-cyan-600',
      street_trader: 'from-red-500 to-pink-600',
      zen_master: 'from-green-500 to-teal-600'
    };
    return colors[personaId as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Live Voice Commentary</h3>
            <p className="text-gray-400 text-sm">AI personas providing real-time market insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-2 rounded-lg transition-all ${
              isVoiceEnabled 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div className="text-sm text-gray-400">
            {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
          </div>
        </div>
      </div>

      {/* Current Narration Display */}
      {currentNarrationData && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${getPersonaColor(currentNarrationData.personaId)} rounded-xl flex items-center justify-center text-xl`}>
              {getPersonaIcon(currentNarrationData.personaId)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-white font-semibold">
                  {personas.find(p => p.id === currentNarrationData.personaId)?.name || 'AI Narrator'}
                </h4>
                <div className="flex items-center space-x-1 text-green-400">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs">LIVE</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {currentNarrationData.content}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <span>ETH: ${currentNarrationData.marketContext.ethPrice.toFixed(2)}</span>
                  <span className={currentNarrationData.marketContext.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ({currentNarrationData.marketContext.priceChange.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(currentNarrationData.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Audio Waveform Visualization */}
          {currentNarrationData.audioData && (
            <div className="mt-4 flex items-center space-x-1 h-8">
              {currentNarrationData.audioData.waveform.slice(0, 30).map((value, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full animate-pulse"
                  style={{
                    width: '2px',
                    height: `${Math.max(4, (value / 100) * 32)}px`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Persona Selection & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select AI Persona</label>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
          >
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {getPersonaIcon(persona.id)} {persona.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Volume</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white text-sm w-12">{volume}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => handleRequestNarration(selectedPersona)}
          disabled={requestNarrationMutation.isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
        >
          <Mic className="w-4 h-4" />
          <span>{requestNarrationMutation.isPending ? 'Requesting...' : 'Request Commentary'}</span>
        </button>
        
        <button
          onClick={handleGenerateNarration}
          disabled={generateNarrationMutation.isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>{generateNarrationMutation.isPending ? 'Generating...' : 'Generate Live Update'}</span>
        </button>
        
        <button
          onClick={() => setAutoNarration(!autoNarration)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            autoNarration
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{autoNarration ? 'Auto Mode On' : 'Auto Mode Off'}</span>
        </button>
      </div>

      {/* Narration Queue */}
      {queueData.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Upcoming Commentary ({queueData.length})</span>
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {queueData.slice(0, 3).map((item: any, index: number) => (
              <div
                key={item.narration.id}
                className="flex items-center space-x-3 p-2 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${getPersonaColor(item.narration.personaId)} rounded-lg flex items-center justify-center text-sm`}>
                  {getPersonaIcon(item.narration.personaId)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {personas.find(p => p.id === item.narration.personaId)?.name || 'AI Narrator'}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {item.narration.content.substring(0, 50)}...
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${currentNarrationData ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-gray-400">
              {currentNarrationData ? 'AI Commentary Active' : 'Waiting for market updates...'}
            </span>
          </div>
          <div className="text-gray-500">
            Queue: {queueData.length} | Auto: {autoNarration ? 'On' : 'Off'}
          </div>
        </div>
      </div>
    </div>
  );
}