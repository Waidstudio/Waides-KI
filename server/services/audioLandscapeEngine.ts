import { EthMonitor } from './ethMonitor';

const ethMonitor = new EthMonitor();

export interface AudioEffect {
  id: string;
  name: string;
  type: 'ambient' | 'event' | 'notification' | 'voice';
  volume: number;
  duration: number;
  loop: boolean;
  trigger: 'continuous' | 'price_change' | 'bot_action' | 'manual';
  intensity: number; // 0-100
}

export interface TradingFloorSound {
  id: string;
  name: string;
  description: string;
  baseVolume: number;
  intensity: number;
  active: boolean;
  marketCondition: 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'any';
}

export interface AudioLandscapeState {
  isActive: boolean;
  masterVolume: number;
  ambientVolume: number;
  effectsVolume: number;
  voiceVolume: number;
  currentMood: 'calm' | 'intense' | 'panic' | 'euphoric' | 'focused';
  activeSounds: string[];
  spatialAudio: boolean;
}

class AudioLandscapeEngine {
  private state: AudioLandscapeState = {
    isActive: false,
    masterVolume: 75,
    ambientVolume: 60,
    effectsVolume: 80,
    voiceVolume: 85,
    currentMood: 'focused',
    activeSounds: [],
    spatialAudio: true
  };

  private tradingFloorSounds: TradingFloorSound[] = [
    {
      id: 'trading_floor_chatter',
      name: 'Trading Floor Chatter',
      description: 'Background voices and conversations from busy trading floor',
      baseVolume: 40,
      intensity: 60,
      active: true,
      marketCondition: 'any'
    },
    {
      id: 'keyboard_typing',
      name: 'Keyboard Typing',
      description: 'Rapid keyboard typing sounds from active trading',
      baseVolume: 35,
      intensity: 70,
      active: true,
      marketCondition: 'any'
    },
    {
      id: 'phone_ringing',
      name: 'Phone Calls',
      description: 'Occasional phone rings and trading conversations',
      baseVolume: 45,
      intensity: 50,
      active: true,
      marketCondition: 'volatile'
    },
    {
      id: 'order_notifications',
      name: 'Order Notifications',
      description: 'Subtle notification sounds for order executions',
      baseVolume: 55,
      intensity: 75,
      active: true,
      marketCondition: 'any'
    },
    {
      id: 'market_bell',
      name: 'Market Bell',
      description: 'Opening/closing bell and major market events',
      baseVolume: 70,
      intensity: 90,
      active: false,
      marketCondition: 'any'
    },
    {
      id: 'price_alerts',
      name: 'Price Alerts',
      description: 'Subtle chimes for significant price movements',
      baseVolume: 60,
      intensity: 80,
      active: true,
      marketCondition: 'volatile'
    },
    {
      id: 'bullish_excitement',
      name: 'Bullish Excitement',
      description: 'Excited voices and celebration sounds during uptrends',
      baseVolume: 50,
      intensity: 85,
      active: false,
      marketCondition: 'bullish'
    },
    {
      id: 'bearish_tension',
      name: 'Bearish Tension',
      description: 'Tense atmosphere with urgent conversations during downtrends',
      baseVolume: 45,
      intensity: 75,
      active: false,
      marketCondition: 'bearish'
    },
    {
      id: 'high_frequency_hum',
      name: 'Server Hum',
      description: 'Low-frequency hum from trading servers and equipment',
      baseVolume: 25,
      intensity: 30,
      active: true,
      marketCondition: 'any'
    },
    {
      id: 'news_alerts',
      name: 'News Alerts',
      description: 'Breaking news notifications and market updates',
      baseVolume: 65,
      intensity: 85,
      active: true,
      marketCondition: 'volatile'
    }
  ];

  private audioEffects: AudioEffect[] = [];

  async updateAudioLandscape(): Promise<void> {
    try {
      const ethData = await ethMonitor.getCurrentPrice();
      const priceChange = ethData.price_change_percentage_24h || 0;
      const volume = ethData.total_volume || 0;

      // Determine market condition
      let marketCondition: 'bullish' | 'bearish' | 'neutral' | 'volatile' = 'neutral';
      if (Math.abs(priceChange) > 5) {
        marketCondition = 'volatile';
      } else if (priceChange > 2) {
        marketCondition = 'bullish';
      } else if (priceChange < -2) {
        marketCondition = 'bearish';
      }

      // Update mood based on market conditions
      this.updateMoodBasedOnMarket(priceChange, volume);

      // Activate appropriate sounds
      this.activateSoundsForCondition(marketCondition);

      // Generate dynamic audio effects
      this.generateDynamicEffects(ethData);

    } catch (error) {
      console.error('Error updating audio landscape:', error);
    }
  }

  private updateMoodBasedOnMarket(priceChange: number, volume: number): void {
    if (Math.abs(priceChange) > 10) {
      this.state.currentMood = priceChange > 0 ? 'euphoric' : 'panic';
    } else if (Math.abs(priceChange) > 5) {
      this.state.currentMood = 'intense';
    } else if (Math.abs(priceChange) > 2) {
      this.state.currentMood = 'focused';
    } else {
      this.state.currentMood = 'calm';
    }
  }

  private activateSoundsForCondition(condition: 'bullish' | 'bearish' | 'neutral' | 'volatile'): void {
    this.state.activeSounds = this.tradingFloorSounds
      .filter(sound => 
        sound.active && 
        (sound.marketCondition === condition || sound.marketCondition === 'any')
      )
      .map(sound => sound.id);
  }

  private generateDynamicEffects(ethData: any): void {
    const priceChange = Math.abs(ethData.price_change_percentage_24h || 0);
    
    // Generate price movement sound effect
    if (priceChange > 1) {
      const effect: AudioEffect = {
        id: `price_movement_${Date.now()}`,
        name: 'Price Movement Effect',
        type: 'event',
        volume: Math.min(priceChange * 10, 100),
        duration: 2000 + (priceChange * 100),
        loop: false,
        trigger: 'price_change',
        intensity: Math.min(priceChange * 20, 100)
      };
      this.audioEffects.push(effect);
    }

    // Clean up old effects
    this.audioEffects = this.audioEffects.filter(
      effect => Date.now() - parseInt(effect.id.split('_').pop() || '0') < 30000
    );
  }

  async generateTradingFloorAmbiance(): Promise<{
    ambientSounds: TradingFloorSound[];
    dynamicEffects: AudioEffect[];
    spatialConfig: any;
    moodSettings: any;
  }> {
    await this.updateAudioLandscape();

    const spatialConfig = this.state.spatialAudio ? {
      enabled: true,
      listener: { x: 0, y: 0, z: 0 },
      sources: [
        { id: 'left_desk', position: { x: -2, y: 0, z: 1 }, sounds: ['keyboard_typing', 'trading_floor_chatter'] },
        { id: 'right_desk', position: { x: 2, y: 0, z: 1 }, sounds: ['phone_ringing', 'order_notifications'] },
        { id: 'center_screen', position: { x: 0, y: 1, z: 0 }, sounds: ['price_alerts', 'news_alerts'] },
        { id: 'server_room', position: { x: 0, y: 0, z: -3 }, sounds: ['high_frequency_hum'] }
      ]
    } : { enabled: false };

    const moodSettings = {
      current: this.state.currentMood,
      volumeMultipliers: {
        calm: { ambient: 0.7, effects: 0.6, voice: 1.0 },
        focused: { ambient: 0.8, effects: 0.8, voice: 1.0 },
        intense: { ambient: 1.0, effects: 1.2, voice: 1.1 },
        euphoric: { ambient: 1.2, effects: 1.5, voice: 1.2 },
        panic: { ambient: 1.3, effects: 1.8, voice: 1.3 }
      }[this.state.currentMood],
      filterEffects: {
        calm: 'none',
        focused: 'slight_compression',
        intense: 'dynamic_range_compression',
        euphoric: 'brightness_boost',
        panic: 'urgency_filter'
      }[this.state.currentMood]
    };

    return {
      ambientSounds: this.tradingFloorSounds.filter(sound => 
        this.state.activeSounds.includes(sound.id)
      ),
      dynamicEffects: this.audioEffects,
      spatialConfig,
      moodSettings
    };
  }

  updateVolume(type: 'master' | 'ambient' | 'effects' | 'voice', volume: number): void {
    switch (type) {
      case 'master':
        this.state.masterVolume = Math.max(0, Math.min(100, volume));
        break;
      case 'ambient':
        this.state.ambientVolume = Math.max(0, Math.min(100, volume));
        break;
      case 'effects':
        this.state.effectsVolume = Math.max(0, Math.min(100, volume));
        break;
      case 'voice':
        this.state.voiceVolume = Math.max(0, Math.min(100, volume));
        break;
    }
  }

  toggleSpatialAudio(): boolean {
    this.state.spatialAudio = !this.state.spatialAudio;
    return this.state.spatialAudio;
  }

  activateAudioLandscape(): void {
    this.state.isActive = true;
    this.updateAudioLandscape();
  }

  deactivateAudioLandscape(): void {
    this.state.isActive = false;
    this.state.activeSounds = [];
    this.audioEffects = [];
  }

  getState(): AudioLandscapeState {
    return { ...this.state };
  }

  getTradingFloorSounds(): TradingFloorSound[] {
    return [...this.tradingFloorSounds];
  }

  toggleSound(soundId: string): boolean {
    const sound = this.tradingFloorSounds.find(s => s.id === soundId);
    if (sound) {
      sound.active = !sound.active;
      if (sound.active && !this.state.activeSounds.includes(soundId)) {
        this.state.activeSounds.push(soundId);
      } else if (!sound.active) {
        this.state.activeSounds = this.state.activeSounds.filter(id => id !== soundId);
      }
      return sound.active;
    }
    return false;
  }
}

export const audioLandscapeEngine = new AudioLandscapeEngine();