import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings, 
  Headphones,
  Waves,
  Activity,
  Phone,
  Keyboard,
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Radio,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TradingFloorSound {
  id: string;
  name: string;
  description: string;
  baseVolume: number;
  intensity: number;
  active: boolean;
  marketCondition: 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'any';
}

interface AudioLandscapeState {
  isActive: boolean;
  masterVolume: number;
  ambientVolume: number;
  effectsVolume: number;
  voiceVolume: number;
  currentMood: 'calm' | 'intense' | 'panic' | 'euphoric' | 'focused';
  activeSounds: string[];
  spatialAudio: boolean;
}

interface AudioLandscapeControlsProps {
  className?: string;
}

const getSoundIcon = (soundId: string) => {
  switch (soundId) {
    case 'trading_floor_chatter': return <Radio className="w-4 h-4" />;
    case 'keyboard_typing': return <Keyboard className="w-4 h-4" />;
    case 'phone_ringing': return <Phone className="w-4 h-4" />;
    case 'order_notifications': return <Bell className="w-4 h-4" />;
    case 'market_bell': return <Bell className="w-4 h-4" />;
    case 'price_alerts': return <AlertTriangle className="w-4 h-4" />;
    case 'bullish_excitement': return <TrendingUp className="w-4 h-4" />;
    case 'bearish_tension': return <TrendingDown className="w-4 h-4" />;
    case 'high_frequency_hum': return <Waves className="w-4 h-4" />;
    case 'news_alerts': return <Zap className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const getMoodColor = (mood: string) => {
  switch (mood) {
    case 'calm': return 'text-blue-400 border-blue-400/40';
    case 'focused': return 'text-green-400 border-green-400/40';
    case 'intense': return 'text-yellow-400 border-yellow-400/40';
    case 'euphoric': return 'text-emerald-400 border-emerald-400/40';
    case 'panic': return 'text-red-400 border-red-400/40';
    default: return 'text-slate-400 border-slate-400/40';
  }
};

export default function AudioLandscapeControls({ className = '' }: AudioLandscapeControlsProps) {
  const [localState, setLocalState] = useState<AudioLandscapeState>({
    isActive: false,
    masterVolume: 75,
    ambientVolume: 60,
    effectsVolume: 80,
    voiceVolume: 85,
    currentMood: 'focused',
    activeSounds: [],
    spatialAudio: true
  });

  const queryClient = useQueryClient();

  // Fetch audio landscape state
  const { data: audioState, refetch: refetchState } = useQuery<{
    success: boolean;
    audioLandscape: {
      ambientSounds: TradingFloorSound[];
      dynamicEffects: any[];
      spatialConfig: any;
      moodSettings: any;
    };
    state: AudioLandscapeState;
  }>({
    queryKey: ['/api/audio-landscape/state'],
    refetchInterval: 5000,
  });

  // Fetch available sounds
  const { data: soundsData } = useQuery<{
    success: boolean;
    sounds: TradingFloorSound[];
  }>({
    queryKey: ['/api/audio-landscape/sounds'],
  });

  // Update local state when data changes
  useEffect(() => {
    if (audioState?.state) {
      setLocalState(audioState.state);
    }
  }, [audioState]);

  // Activate/Deactivate audio landscape
  const toggleAudioLandscapeMutation = useMutation({
    mutationFn: async (activate: boolean) => {
      const response = await fetch(`/api/audio-landscape/${activate ? 'activate' : 'deactivate'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      refetchState();
    }
  });

  // Update volume
  const updateVolumeMutation = useMutation({
    mutationFn: async ({ type, volume }: { type: string; volume: number }) => {
      const response = await fetch('/api/audio-landscape/volume', {
        method: 'POST',
        body: JSON.stringify({ type, volume }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      refetchState();
    }
  });

  // Toggle sound
  const toggleSoundMutation = useMutation({
    mutationFn: async (soundId: string) => {
      const response = await fetch('/api/audio-landscape/toggle-sound', {
        method: 'POST',
        body: JSON.stringify({ soundId }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      refetchState();
    }
  });

  // Toggle spatial audio
  const toggleSpatialMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/audio-landscape/spatial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      refetchState();
    }
  });

  const handleVolumeChange = (type: string, value: number[]) => {
    const volume = value[0];
    setLocalState(prev => ({ ...prev, [`${type}Volume`]: volume }));
    updateVolumeMutation.mutate({ type, volume });
  };

  const toggleAudioLandscape = () => {
    toggleAudioLandscapeMutation.mutate(!localState.isActive);
  };

  const toggleSound = (soundId: string) => {
    toggleSoundMutation.mutate(soundId);
  };

  const toggleSpatialAudio = () => {
    toggleSpatialMutation.mutate();
  };

  return (
    <Card className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur shadow-xl ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white flex items-center space-x-2">
            <Headphones className="w-6 h-6 text-orange-400" />
            <span>Trading Floor Audio</span>
          </CardTitle>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={getMoodColor(localState.currentMood)}>
              {localState.currentMood.toUpperCase()}
            </Badge>
            <Button
              onClick={toggleAudioLandscape}
              disabled={toggleAudioLandscapeMutation.isPending}
              variant={localState.isActive ? "default" : "outline"}
              className={localState.isActive 
                ? "bg-orange-600 hover:bg-orange-700" 
                : "border-orange-400/40 text-orange-400 hover:bg-orange-400/10"
              }
            >
              {localState.isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="controls" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="controls" className="text-xs sm:text-sm">
              <Volume2 className="w-4 h-4 mr-1" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="sounds" className="text-xs sm:text-sm">
              <Waves className="w-4 h-4 mr-1" />
              Sounds
            </TabsTrigger>
            <TabsTrigger value="spatial" className="text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1" />
              Spatial
            </TabsTrigger>
          </TabsList>

          {/* Volume Controls */}
          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Master Volume</label>
                  <span className="text-xs text-slate-400">{localState.masterVolume}%</span>
                </div>
                <Slider
                  value={[localState.masterVolume]}
                  onValueChange={(value) => handleVolumeChange('master', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Ambient Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Ambient</label>
                  <span className="text-xs text-slate-400">{localState.ambientVolume}%</span>
                </div>
                <Slider
                  value={[localState.ambientVolume]}
                  onValueChange={(value) => handleVolumeChange('ambient', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Effects Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Effects</label>
                  <span className="text-xs text-slate-400">{localState.effectsVolume}%</span>
                </div>
                <Slider
                  value={[localState.effectsVolume]}
                  onValueChange={(value) => handleVolumeChange('effects', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Voice Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Voice</label>
                  <span className="text-xs text-slate-400">{localState.voiceVolume}%</span>
                </div>
                <Slider
                  value={[localState.voiceVolume]}
                  onValueChange={(value) => handleVolumeChange('voice', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Audio Stats */}
            <div className="bg-slate-800/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Audio Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{localState.activeSounds.length}</div>
                  <div className="text-slate-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{localState.currentMood}</div>
                  <div className="text-slate-400">Mood</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{localState.spatialAudio ? 'ON' : 'OFF'}</div>
                  <div className="text-slate-400">3D Audio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{localState.isActive ? 'LIVE' : 'OFF'}</div>
                  <div className="text-slate-400">Status</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sound Management */}
          <TabsContent value="sounds" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {soundsData?.sounds?.map((sound) => (
                <div
                  key={sound.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    sound.active 
                      ? 'bg-orange-500/10 border-orange-400/40' 
                      : 'bg-slate-800/30 border-slate-600/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${sound.active ? 'text-orange-400' : 'text-slate-500'}`}>
                      {getSoundIcon(sound.id)}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${sound.active ? 'text-white' : 'text-slate-400'}`}>
                        {sound.name}
                      </div>
                      <div className="text-xs text-slate-500">{sound.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs border-slate-600 text-slate-400"
                    >
                      {sound.marketCondition}
                    </Badge>
                    <Switch
                      checked={sound.active}
                      onCheckedChange={() => toggleSound(sound.id)}
                      disabled={toggleSoundMutation.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Spatial Audio Settings */}
          <TabsContent value="spatial" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-white">3D Spatial Audio</h4>
                  <p className="text-xs text-slate-400">Immersive positioning of trading floor sounds</p>
                </div>
                <Switch
                  checked={localState.spatialAudio}
                  onCheckedChange={toggleSpatialAudio}
                  disabled={toggleSpatialMutation.isPending}
                />
              </div>

              {localState.spatialAudio && (
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Audio Sources</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-slate-400">Left Desk: Typing, Chatter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-slate-400">Right Desk: Phones, Orders</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-400">Center: Alerts, News</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-slate-400">Background: Server Hum</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}