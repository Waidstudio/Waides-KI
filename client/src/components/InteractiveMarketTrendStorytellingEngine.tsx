import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Eye,
  Sparkles,
  Brain,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  Layers
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MarketStoryChapter {
  id: string;
  title: string;
  timeframe: string;
  narrative: string;
  priceAction: {
    from: number;
    to: number;
    change: number;
    volume: number;
  };
  keyEvents: string[];
  emotions: {
    fear: number;
    greed: number;
    hope: number;
    panic: number;
  };
  technicalSignals: {
    rsi: number;
    macd: string;
    support: number;
    resistance: number;
  };
  nextChapterPreview: string;
}

interface StorytellingState {
  isPlaying: boolean;
  currentChapter: number;
  speed: number;
  volume: number;
  autoAdvance: boolean;
  narrationEnabled: boolean;
}

interface MarketPersona {
  id: string;
  name: string;
  personality: string;
  voiceStyle: string;
  expertise: string[];
  narrativeStyle: string;
}

export default function InteractiveMarketTrendStorytellingEngine() {
  const [storytellingState, setStorytellingState] = useState<StorytellingState>({
    isPlaying: false,
    currentChapter: 0,
    speed: 1,
    volume: 75,
    autoAdvance: true,
    narrationEnabled: true,
  });

  const [selectedPersona, setSelectedPersona] = useState<string>('sage_trader');
  const [storyMode, setStoryMode] = useState<string>('epic'); // epic, dramatic, technical, zen
  const [visualMode, setVisualMode] = useState<string>('cinematic'); // cinematic, technical, abstract
  const [interactionMode, setInteractionMode] = useState<string>('guided'); // guided, free_explore, quiz
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const narratorRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch market story data
  const { data: marketStory, refetch: refetchStory } = useQuery<MarketStoryChapter[]>({
    queryKey: ['/api/market-storytelling/story', selectedPersona, storyMode],
    refetchInterval: storytellingState.isPlaying ? 30000 : false,
  });

  const { data: storyMetrics } = useQuery({
    queryKey: ['/api/market-storytelling/metrics'],
    refetchInterval: 10000,
  });

  // Market personas for different storytelling styles
  const marketPersonas: MarketPersona[] = [
    {
      id: 'sage_trader',
      name: 'The Sage Trader',
      personality: 'Wise and experienced, speaks with gravitas',
      voiceStyle: 'Deep, measured, contemplative',
      expertise: ['Risk Management', 'Market Psychology', 'Long-term Trends'],
      narrativeStyle: 'Philosophical with ancient wisdom metaphors'
    },
    {
      id: 'data_scientist',
      name: 'The Data Scientist',
      personality: 'Analytical and precise, loves numbers',
      voiceStyle: 'Clear, factual, confident',
      expertise: ['Technical Analysis', 'Statistics', 'Algorithms'],
      narrativeStyle: 'Data-driven with scientific explanations'
    },
    {
      id: 'street_trader',
      name: 'The Street Trader',
      personality: 'Fast-paced and energetic, market veteran',
      voiceStyle: 'Quick, excited, passionate',
      expertise: ['Day Trading', 'Market Sentiment', 'Quick Decisions'],
      narrativeStyle: 'High-energy with trading floor intensity'
    },
    {
      id: 'zen_master',
      name: 'The Zen Master',
      personality: 'Calm and mindful, sees bigger picture',
      voiceStyle: 'Peaceful, slow, meditative',
      expertise: ['Emotional Control', 'Patience', 'Inner Balance'],
      narrativeStyle: 'Meditation-focused with spiritual metaphors'
    }
  ];

  // Control functions
  const playStory = () => {
    setStorytellingState(prev => ({ ...prev, isPlaying: true }));
    if (storytellingState.narrationEnabled) {
      startNarration();
    }
  };

  const pauseStory = () => {
    setStorytellingState(prev => ({ ...prev, isPlaying: false }));
    if (narratorRef.current) {
      window.speechSynthesis.cancel();
    }
  };

  const nextChapter = () => {
    if (marketStory && storytellingState.currentChapter < marketStory.length - 1) {
      setStorytellingState(prev => ({ 
        ...prev, 
        currentChapter: prev.currentChapter + 1 
      }));
    }
  };

  const previousChapter = () => {
    if (storytellingState.currentChapter > 0) {
      setStorytellingState(prev => ({ 
        ...prev, 
        currentChapter: prev.currentChapter - 1 
      }));
    }
  };

  const startNarration = () => {
    if (marketStory && marketStory[storytellingState.currentChapter]) {
      const chapter = marketStory[storytellingState.currentChapter];
      const utterance = new SpeechSynthesisUtterance(chapter.narrative);
      
      // Set voice characteristics based on persona
      const voices = window.speechSynthesis.getVoices();
      const persona = marketPersonas.find(p => p.id === selectedPersona);
      
      if (persona) {
        // Try to match voice to persona characteristics
        let selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') && 
          voice.lang.startsWith('en')
        );
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Adjust speech characteristics
        switch (selectedPersona) {
          case 'sage_trader':
            utterance.rate = 0.8;
            utterance.pitch = 0.7;
            break;
          case 'data_scientist':
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            break;
          case 'street_trader':
            utterance.rate = 1.3;
            utterance.pitch = 1.2;
            break;
          case 'zen_master':
            utterance.rate = 0.6;
            utterance.pitch = 0.8;
            break;
        }
      }
      
      utterance.volume = storytellingState.volume / 100;
      utterance.onend = () => {
        if (storytellingState.autoAdvance && storytellingState.isPlaying) {
          setTimeout(nextChapter, 2000);
        }
      };
      
      narratorRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-advance logic
  useEffect(() => {
    if (storytellingState.isPlaying && storytellingState.autoAdvance) {
      const interval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          nextChapter();
        }
      }, 15000 / storytellingState.speed);
      
      return () => clearInterval(interval);
    }
  }, [storytellingState.isPlaying, storytellingState.autoAdvance, storytellingState.speed]);

  // Get current chapter data
  const currentChapter = marketStory?.[storytellingState.currentChapter];
  const progress = marketStory ? ((storytellingState.currentChapter + 1) / marketStory.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%)
            `,
            animation: 'float 20s ease-in-out infinite'
          }}
        ></div>
      </div>

      <div className="relative z-10 p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Interactive Market Storytelling
          </h1>
          <p className="text-lg lg:text-xl text-slate-300 max-w-4xl mx-auto">
            Experience market movements through immersive narratives with AI-powered storytelling and voice narration
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Story Display */}
          <div className="xl:col-span-2 space-y-6">
            {/* Story Controls */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-400/40 backdrop-blur shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    <span>Story Controls</span>
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-400/40 text-purple-400">
                    Chapter {storytellingState.currentChapter + 1} of {marketStory?.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Playback Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousChapter}
                    disabled={storytellingState.currentChapter === 0}
                    className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={storytellingState.isPlaying ? pauseStory : playStory}
                    className={`w-16 h-16 rounded-full ${
                      storytellingState.isPlaying 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {storytellingState.isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextChapter}
                    disabled={!marketStory || storytellingState.currentChapter >= marketStory.length - 1}
                    className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Story Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-slate-700" />
                </div>

                {/* Audio Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {storytellingState.volume > 0 ? (
                        <Volume2 className="w-4 h-4 text-slate-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm text-slate-400">Volume</span>
                    </div>
                    <Slider
                      value={[storytellingState.volume]}
                      onValueChange={(value) => 
                        setStorytellingState(prev => ({ ...prev, volume: value[0] }))
                      }
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">Speed</span>
                    </div>
                    <Slider
                      value={[storytellingState.speed]}
                      onValueChange={(value) => 
                        setStorytellingState(prev => ({ ...prev, speed: value[0] }))
                      }
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Chapter Display */}
            {currentChapter && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-400/40 backdrop-blur shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white mb-2">{currentChapter.title}</CardTitle>
                      <Badge variant="outline" className="border-cyan-400/40 text-cyan-400">
                        {currentChapter.timeframe}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {currentChapter.priceAction.change >= 0 ? (
                          <ArrowUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-lg font-bold ${
                          currentChapter.priceAction.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {currentChapter.priceAction.change > 0 ? '+' : ''}{currentChapter.priceAction.change.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        ${currentChapter.priceAction.from.toLocaleString()} → ${currentChapter.priceAction.to.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Narrative Text */}
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <p className="text-slate-200 leading-relaxed text-lg">
                      {currentChapter.narrative}
                    </p>
                  </div>

                  {/* Key Events */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <span>Key Events</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentChapter.keyEvents.map((event, index) => (
                        <div key={index} className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-slate-300 text-sm">{event}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Emotions */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-pink-400" />
                      <span>Market Emotions</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(currentChapter.emotions).map(([emotion, value]) => (
                        <div key={emotion} className="text-center">
                          <div className={`text-2xl mb-1 ${
                            emotion === 'fear' ? 'text-red-400' :
                            emotion === 'greed' ? 'text-green-400' :
                            emotion === 'hope' ? 'text-blue-400' : 'text-purple-400'
                          }`}>
                            {emotion === 'fear' ? '😨' : 
                             emotion === 'greed' ? '🤑' :
                             emotion === 'hope' ? '🤞' : '😱'}
                          </div>
                          <div className="text-sm text-slate-400 capitalize mb-1">{emotion}</div>
                          <Progress value={value} className="h-2 bg-slate-700" />
                          <div className="text-xs text-slate-500 mt-1">{value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Chapter Preview */}
                  {currentChapter.nextChapterPreview && (
                    <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-4 border border-purple-400/20">
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">Coming Next...</h4>
                      <p className="text-slate-300 text-sm italic">{currentChapter.nextChapterPreview}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel - Controls & Technical Data */}
          <div className="space-y-6">
            {/* Persona Selection */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-400" />
                  <span>Storyteller</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {marketPersonas.map((persona) => (
                    <Button
                      key={persona.id}
                      variant={selectedPersona === persona.id ? "default" : "outline"}
                      className={`w-full justify-start text-left p-3 h-auto ${
                        selectedPersona === persona.id 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'border-green-400/40 text-green-400 hover:bg-green-400/10'
                      }`}
                      onClick={() => setSelectedPersona(persona.id)}
                    >
                      <div>
                        <div className="font-medium">{persona.name}</div>
                        <div className="text-xs opacity-75">{persona.narrativeStyle}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technical Signals */}
            {currentChapter && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-yellow-400/40 backdrop-blur shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                    <span>Technical Signals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{currentChapter.technicalSignals.rsi}</div>
                      <div className="text-xs text-slate-400">RSI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{currentChapter.technicalSignals.macd}</div>
                      <div className="text-xs text-slate-400">MACD</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-400">${currentChapter.technicalSignals.support.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-red-400">${currentChapter.technicalSignals.resistance.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Resistance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Story Metrics */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span>Story Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chapters Completed</span>
                    <span className="text-white font-medium">{storytellingState.currentChapter + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Story Mode</span>
                    <Badge variant="outline" className="border-blue-400/40 text-blue-400 text-xs">
                      {storyMode}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Narration</span>
                    <span className={`text-sm font-medium ${
                      storytellingState.narrationEnabled ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {storytellingState.narrationEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto-Advance</span>
                    <span className={`text-sm font-medium ${
                      storytellingState.autoAdvance ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {storytellingState.autoAdvance ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-600/40 backdrop-blur shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-slate-400" />
                  <span>Quick Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Narration</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStorytellingState(prev => ({ 
                      ...prev, 
                      narrationEnabled: !prev.narrationEnabled 
                    }))}
                    className={`${
                      storytellingState.narrationEnabled 
                        ? 'border-green-400/40 text-green-400' 
                        : 'border-slate-600/40 text-slate-400'
                    }`}
                  >
                    {storytellingState.narrationEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Auto-Advance</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStorytellingState(prev => ({ 
                      ...prev, 
                      autoAdvance: !prev.autoAdvance 
                    }))}
                    className={`${
                      storytellingState.autoAdvance 
                        ? 'border-green-400/40 text-green-400' 
                        : 'border-slate-600/40 text-slate-400'
                    }`}
                  >
                    {storytellingState.autoAdvance ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}