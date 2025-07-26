import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Layers,
  Headphones,
  Settings,
  Film,
  Globe,
  Cpu,
  Waves,
  Hexagon,
  Share2,
  Download,
  Star,
  History,
  Palette,
  Mic,
  Camera,
  Monitor,
  Smartphone
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import VoiceNarrationControls from './VoiceNarrationControls';
import AudioLandscapeControls from './AudioLandscapeControls';

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
  
  // Live Commentary Integration States
  const [liveCommentaryMode, setLiveCommentaryMode] = useState(false);
  const [availableLiveCommentary, setAvailableLiveCommentary] = useState<any[]>([]);
  const [isPlayingLiveCommentary, setIsPlayingLiveCommentary] = useState(false);
  
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

  const queryClient = useQueryClient();

  // Story Control Mutations
  const playStoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/market-storytelling/controls/play', {
        method: 'POST',
        body: JSON.stringify({
          persona: selectedPersona,
          mode: storyMode,
          speed: storytellingState.speed,
          chapter: storytellingState.currentChapter
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setStorytellingState(prev => ({ ...prev, isPlaying: true }));
      if (storytellingState.narrationEnabled) {
        startNarration();
      }
      // Generate voice narration
      generateVoiceNarration.mutate();
    }
  });

  const pauseStoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/market-storytelling/controls/pause', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      setStorytellingState(prev => ({ ...prev, isPlaying: false }));
      if (narratorRef.current) {
        window.speechSynthesis.cancel();
      }
    }
  });

  const generateVoiceNarration = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/voice-narration/generate', {
        method: 'POST'
      });
    }
  });

  // Live Commentary Integration Queries
  const { data: liveCommentaryData, refetch: refetchLiveCommentary } = useQuery({
    queryKey: ['/api/market-storytelling/live-commentary'],
    refetchInterval: 15000, // Refresh every 15 seconds for new commentary
    enabled: liveCommentaryMode,
  });

  // Update available commentary when data changes
  useEffect(() => {
    if (liveCommentaryData && typeof liveCommentaryData === 'object' && 'commentary' in liveCommentaryData) {
      const data = liveCommentaryData as { commentary: any[] };
      setAvailableLiveCommentary(data.commentary);
    }
  }, [liveCommentaryData]);

  // Play Live Commentary Mutation
  const playLiveCommentaryMutation = useMutation({
    mutationFn: async (commentaryId: string) => {
      return await apiRequest('/api/market-storytelling/play-live', {
        method: 'POST',
        body: { commentaryId }
      });
    },
    onSuccess: (data: any) => {
      setIsPlayingLiveCommentary(true);
      // Stop regular story playback when playing live commentary
      if (storytellingState.isPlaying) {
        pauseStoryMutation.mutate();
      }
      console.log('Playing live commentary:', data);
      setTimeout(() => {
        setIsPlayingLiveCommentary(false);
      }, (data.duration || 10) * 1000);
    }
  });

  // Control functions
  const playStory = () => {
    playStoryMutation.mutate();
  };

  const pauseStory = () => {
    pauseStoryMutation.mutate();
  };

  const nextChapterMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/market-storytelling/controls/next', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      if (marketStory && storytellingState.currentChapter < marketStory.length - 1) {
        setStorytellingState(prev => ({ 
          ...prev, 
          currentChapter: prev.currentChapter + 1 
        }));
        // Generate voice narration for new chapter
        if (storytellingState.isPlaying && storytellingState.narrationEnabled) {
          generateVoiceNarration.mutate();
        }
      }
    }
  });

  const previousChapterMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/market-storytelling/controls/previous', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      if (storytellingState.currentChapter > 0) {
        setStorytellingState(prev => ({ 
          ...prev, 
          currentChapter: prev.currentChapter - 1 
        }));
        // Generate voice narration for previous chapter
        if (storytellingState.isPlaying && storytellingState.narrationEnabled) {
          generateVoiceNarration.mutate();
        }
      }
    }
  });

  const nextChapter = () => {
    nextChapterMutation.mutate();
  };

  const previousChapter = () => {
    previousChapterMutation.mutate();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden pb-20 sm:pb-24">
      {/* Enhanced Futuristic Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 60%),
              radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
              radial-gradient(circle at 40% 90%, rgba(168, 85, 247, 0.3) 0%, transparent 60%),
              conic-gradient(from 0deg at 50% 50%, rgba(139, 92, 246, 0.1) 0deg, transparent 60deg, rgba(59, 130, 246, 0.1) 120deg, transparent 180deg, rgba(168, 85, 247, 0.1) 240deg, transparent 300deg)
            `,
            animation: 'float 25s ease-in-out infinite, pulse 8s ease-in-out infinite alternate'
          }}
        ></div>
      </div>

      {/* Neural Network Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'gridShift 30s linear infinite'
        }}></div>
      </div>

      {/* Floating Quantum Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-12">
        {/* Enhanced Futuristic Header */}
        <div className="text-center space-y-6 mb-12">
          {/* Neural Network Header Badge */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-full blur-md opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-3">
                <span className="text-purple-300 font-semibold flex items-center space-x-2">
                  <Film className="w-5 h-5" />
                  <span>AI-Powered Market Cinema</span>
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            Neural Market Storytelling
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Experience market movements through immersive AI narratives, emotional intelligence, and real-time data storytelling
          </p>
          
          {/* Live Status Indicators */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
            <Badge variant="outline" className="border-green-400/40 text-green-400 animate-pulse">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Live Market Data
            </Badge>
            <Badge variant="outline" className="border-blue-400/40 text-blue-400 animate-pulse">
              <Brain className="w-3 h-3 mr-1" />
              AI Narrator Active
            </Badge>
            <Badge variant="outline" className="border-purple-400/40 text-purple-400 animate-pulse">
              <Waves className="w-3 h-3 mr-1" />
              Real-time Audio
            </Badge>
            <Badge variant="outline" className="border-cyan-400/40 text-cyan-400 animate-pulse">
              <Hexagon className="w-3 h-3 mr-1" />
              Quantum Processing
            </Badge>
          </div>
        </div>

        {/* Advanced Tabbed Interface */}
        <Tabs defaultValue="live-story" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 bg-slate-800/50 backdrop-blur-sm border border-purple-400/20 rounded-xl p-1 mb-8">
            <TabsTrigger value="live-story" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Live Story</span>
              <span className="sm:hidden">Story</span>
            </TabsTrigger>
            <TabsTrigger value="ai-narrator" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Narrator</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="market-emotions" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Emotions</span>
              <span className="sm:hidden">Feel</span>
            </TabsTrigger>
            <TabsTrigger value="neural-analysis" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Neural</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Visual</span>
              <span className="sm:hidden">VFX</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Set</span>
            </TabsTrigger>
          </TabsList>

          {/* Live Story Tab Content */}
          <TabsContent value="live-story" className="space-y-6">
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
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-400/40 text-purple-400">
                      Chapter {storytellingState.currentChapter + 1} of {marketStory?.length || 0}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLiveCommentaryMode(!liveCommentaryMode)}
                      className={`border-green-400/40 ${liveCommentaryMode ? 'bg-green-400/20 text-green-400' : 'text-green-400 hover:bg-green-400/10'}`}
                    >
                      <Mic className="w-3 h-3 mr-1" />
                      Live {liveCommentaryMode ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live Commentary Section */}
                {liveCommentaryMode && (
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-400/20 mb-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center space-x-2">
                      <Headphones className="w-4 h-4" />
                      <span>Live AI Commentary Queue</span>
                      {isPlayingLiveCommentary && (
                        <Badge variant="outline" className="border-green-400/40 text-green-400 animate-pulse">
                          Playing Live
                        </Badge>
                      )}
                      {liveCommentaryData?.count > 0 && (
                        <Badge variant="outline" className="border-green-400/40 text-green-400">
                          {liveCommentaryData.count} Available
                        </Badge>
                      )}
                    </h4>
                    {availableLiveCommentary.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableLiveCommentary.slice(0, 3).map((commentary, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                            <div className="flex-1">
                              <div className="text-sm text-white">{commentary.title || `Live Commentary ${index + 1}`}</div>
                              <div className="text-xs text-slate-400">{commentary.personaId || 'KonsAI'} • {commentary.duration || 10}s</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => playLiveCommentaryMutation.mutate(commentary.id || `commentary-${index}`)}
                              disabled={isPlayingLiveCommentary || playLiveCommentaryMutation.isPending}
                              className="border-green-400/40 text-green-400 hover:bg-green-400/10"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 text-center py-2">
                        No live commentary available. Enable voice narration system to generate new commentary.
                      </div>
                    )}
                  </div>
                )}

                {/* Playback Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousChapter}
                    disabled={storytellingState.currentChapter === 0 || previousChapterMutation.isPending}
                    className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                  >
                    {previousChapterMutation.isPending ? (
                      <div className="w-4 h-4 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SkipBack className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={storytellingState.isPlaying ? pauseStory : playStory}
                    disabled={playStoryMutation.isPending || pauseStoryMutation.isPending || isPlayingLiveCommentary}
                    className={`w-16 h-16 rounded-full ${
                      storytellingState.isPlaying 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } ${
                      (playStoryMutation.isPending || pauseStoryMutation.isPending || isPlayingLiveCommentary) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    {playStoryMutation.isPending || pauseStoryMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPlayingLiveCommentary ? (
                      <Mic className="w-8 h-8" />
                    ) : storytellingState.isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextChapter}
                    disabled={!marketStory || storytellingState.currentChapter >= marketStory.length - 1 || nextChapterMutation.isPending}
                    className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                  >
                    {nextChapterMutation.isPending ? (
                      <div className="w-4 h-4 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SkipForward className="w-4 h-4" />
                    )}
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
      </TabsContent>

    {/* AI Narrator Tab Content */}
    <TabsContent value="ai-narrator" className="space-y-6">
      {/* Live Voice Narration Controls */}
      <VoiceNarrationControls className="mb-6" />
      
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-400" />
            <span>Neural AI Narrator</span>
            <Badge variant="outline" className="border-blue-400/40 text-blue-400 ml-auto">
              Advanced Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border border-blue-400/20">
              <CardContent className="p-4 text-center">
                <Headphones className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-blue-300 font-semibold">Voice Quality</p>
                <p className="text-xs text-slate-400">Neural Synthesis</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border border-purple-400/20">
              <CardContent className="p-4 text-center">
                <Mic className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-purple-300 font-semibold">Live Recording</p>
                <p className="text-xs text-slate-400">Real-time Mode</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border border-green-400/20">
              <CardContent className="p-4 text-center">
                <Waves className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-300 font-semibold">Audio Effects</p>
                <p className="text-xs text-slate-400">3D Spatial</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Market Emotions Tab Content */}
    <TabsContent value="market-emotions" className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-orange-400" />
            <span>Emotional Intelligence Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-400">Fear</p>
                <p className="text-xs text-slate-400">High Alert</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-sm font-semibold text-green-400">Greed</p>
                <p className="text-xs text-slate-400">Moderate</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Star className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-blue-400">Hope</p>
                <p className="text-xs text-slate-400">Rising</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-purple-400">Panic</p>
                <p className="text-xs text-slate-400">Low</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Neural Analysis Tab Content */}
    <TabsContent value="neural-analysis" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-400/40 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <span>Neural Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Processing Speed</span>
                <Badge className="bg-cyan-400/20 text-cyan-400">98.7%</Badge>
              </div>
              <Progress value={98.7} className="h-2 bg-slate-700" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Pattern Recognition</span>
                <Badge className="bg-purple-400/20 text-purple-400">95.2%</Badge>
              </div>
              <Progress value={95.2} className="h-2 bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center space-x-2">
              <Globe className="w-6 h-6 text-green-400" />
              <span>Global Sentiment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-400">🚀 Bullish</div>
              <p className="text-sm text-slate-300">Market confidence at 73%</p>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge className="bg-green-400/20 text-green-400">+2.8%</Badge>
                <Badge className="bg-blue-400/20 text-blue-400">Volume: High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    {/* Visualization Tab Content */}
    <TabsContent value="visualization" className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-pink-400/40 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center space-x-2">
            <Monitor className="w-6 h-6 text-pink-400" />
            <span>Visual Experience Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2 border-pink-400/40 text-pink-400 hover:bg-pink-400/10">
              <Camera className="w-6 h-6" />
              <span className="text-xs">Cinematic Mode</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 border-blue-400/40 text-blue-400 hover:bg-blue-400/10">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs">Technical Charts</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 border-purple-400/40 text-purple-400 hover:bg-purple-400/10">
              <Layers className="w-6 h-6" />
              <span className="text-xs">Abstract Art</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Settings Tab Content */}
    <TabsContent value="settings" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center space-x-2">
              <Settings className="w-6 h-6 text-orange-400" />
              <span>Experience Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Storytelling Speed</label>
              <Slider
                value={[storytellingState.speed]}
                onValueChange={(value) => setStorytellingState(prev => ({ ...prev, speed: value[0] }))}
                max={3}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Audio Volume</label>
              <Slider
                value={[storytellingState.volume]}
                onValueChange={(value) => setStorytellingState(prev => ({ ...prev, volume: value[0] }))}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-teal-400/40 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center space-x-2">
              <Palette className="w-6 h-6 text-teal-400" />
              <span>Personalization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Mobile Optimized</span>
                <Button variant="outline" size="sm" className="border-teal-400/40 text-teal-400">
                  <Smartphone className="w-4 h-4 mr-1" />
                  Active
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Share Stories</span>
                <Button variant="outline" size="sm" className="border-blue-400/40 text-blue-400">
                  <Share2 className="w-4 h-4 mr-1" />
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Export Mode</span>
                <Button variant="outline" size="sm" className="border-green-400/40 text-green-400">
                  <Download className="w-4 h-4 mr-1" />
                  Ready
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes gridShift {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(40px) translateY(40px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}