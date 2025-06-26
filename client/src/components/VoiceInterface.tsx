import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Zap, Brain, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: string;
  response?: string;
  action?: string;
}

interface VoiceSettings {
  speechRecognition: boolean;
  voiceResponse: boolean;
  continuousListening: boolean;
  voiceType: 'male' | 'female' | 'robotic';
  responseSpeed: number;
  activationKeyword: string;
}

export default function VoiceInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<VoiceSettings>({
    speechRecognition: true,
    voiceResponse: true,
    continuousListening: false,
    voiceType: 'female',
    responseSpeed: 1.0,
    activationKeyword: 'waides'
  });

  // Voice command processing mutation
  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      return apiRequest('/api/voice/process-command', {
        method: 'POST',
        body: { command, timestamp: new Date().toISOString() }
      });
    },
    onSuccess: (data) => {
      if (data.response && settings.voiceResponse) {
        speakResponse(data.response);
      }
    }
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = settings.continuousListening;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (settings.continuousListening && voiceEnabled) {
            setTimeout(() => startListening(), 1000);
          }
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          const confidence = event.results[event.results.length - 1][0].confidence;
          
          setCurrentCommand(transcript);

          if (event.results[event.results.length - 1].isFinal) {
            const command: VoiceCommand = {
              command: transcript.toLowerCase(),
              confidence: confidence || 0.9,
              timestamp: new Date().toISOString()
            };

            // Check for activation keyword
            if (command.command.includes(settings.activationKeyword.toLowerCase()) || 
                !settings.continuousListening) {
              setVoiceCommands(prev => [command, ...prev.slice(0, 9)]);
              setIsProcessing(true);
              processCommandMutation.mutate(command.command);
              setTimeout(() => setIsProcessing(false), 2000);
            }
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize audio visualization
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          micStreamRef.current = stream;
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          
          analyser.fftSize = 256;
          microphone.connect(analyser);
          analyserRef.current = analyser;

          // Start audio level monitoring
          const updateAudioLevel = () => {
            if (analyserRef.current) {
              const bufferLength = analyserRef.current.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);
              analyserRef.current.getByteFrequencyData(dataArray);
              
              const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
              setVoiceLevel(average / 255);
            }
            requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        })
        .catch(err => console.error('Microphone access denied:', err));
    }

    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [settings]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleVoiceInterface = () => {
    if (voiceEnabled) {
      stopListening();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      if (settings.continuousListening) {
        startListening();
      }
    }
  };

  const speakResponse = (text: string) => {
    if (synthRef.current && settings.voiceResponse) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.responseSpeed;
      utterance.pitch = settings.voiceType === 'female' ? 1.2 : settings.voiceType === 'male' ? 0.8 : 1.0;
      utterance.volume = 0.8;
      
      synthRef.current.speak(utterance);
    }
  };

  // Voice status query
  const { data: voiceStatus } = useQuery({
    queryKey: ['/api/voice/status'],
    refetchInterval: 5000
  });

  return (
    <div className="bg-gray-900/95 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Voice Interface</h3>
            <p className="text-sm text-gray-400">Hands-free trading control</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleVoiceInterface}
            className={`p-3 rounded-lg transition-all ${
              voiceEnabled 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Voice Level Visualization */}
      {voiceEnabled && (
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm text-gray-400">Voice Level:</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-purple-500 transition-all duration-150"
                style={{ width: `${voiceLevel * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(voiceLevel * 100)}%</span>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/20">
          <div className="flex items-center space-x-2 mb-1">
            {isListening ? (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-2 h-2 bg-gray-500 rounded-full" />
            )}
            <span className="text-sm text-gray-400">Status</span>
          </div>
          <div className="text-white font-medium">
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/20">
          <div className="text-sm text-gray-400 mb-1">Commands Processed</div>
          <div className="text-white font-medium">{voiceCommands.length}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/20">
          <div className="text-sm text-gray-400 mb-1">Activation Word</div>
          <div className="text-purple-400 font-medium">"{settings.activationKeyword}"</div>
        </div>
      </div>

      {/* Current Command Display */}
      {currentCommand && (
        <div className="mb-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="text-sm text-purple-400 mb-1">Current Command:</div>
          <div className="text-white font-medium">"{currentCommand}"</div>
        </div>
      )}

      {/* Voice Commands History */}
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        <div className="text-sm font-medium text-gray-300 mb-2">Recent Commands:</div>
        {voiceCommands.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No voice commands yet. Try saying "{settings.activationKeyword} status" to get started.
          </div>
        ) : (
          voiceCommands.map((cmd, index) => (
            <div key={index} className="bg-gray-800/30 rounded-lg p-3 border border-gray-600/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">
                  {new Date(cmd.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-purple-400">
                    {Math.round(cmd.confidence * 100)}% confidence
                  </span>
                  {cmd.action && (
                    <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                      {cmd.action}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-white font-medium mb-1">"{cmd.command}"</div>
              {cmd.response && (
                <div className="text-sm text-cyan-400 mt-2 p-2 bg-cyan-900/20 rounded border border-cyan-500/20">
                  Response: {cmd.response}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => processCommandMutation.mutate('show status')}
          className="p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Status</span>
        </button>
        
        <button
          onClick={() => processCommandMutation.mutate('predict eth')}
          className="p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Brain className="w-4 h-4" />
          <span className="text-sm">Predict</span>
        </button>
        
        <button
          onClick={() => processCommandMutation.mutate('start trading')}
          className="p-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm">Trade</span>
        </button>
        
        <button
          onClick={() => processCommandMutation.mutate('emergency stop')}
          className="p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <VolumeX className="w-4 h-4" />
          <span className="text-sm">Stop</span>
        </button>
      </div>

      {/* Voice Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/20 space-y-4">
          <h4 className="text-white font-medium mb-3">Voice Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Activation Keyword</label>
              <input
                type="text"
                value={settings.activationKeyword}
                onChange={(e) => setSettings(prev => ({ ...prev, activationKeyword: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Voice Type</label>
              <select
                value={settings.voiceType}
                onChange={(e) => setSettings(prev => ({ ...prev, voiceType: e.target.value as any }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="robotic">Robotic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Response Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.responseSpeed}
                onChange={(e) => setSettings(prev => ({ ...prev, responseSpeed: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{settings.responseSpeed}x</span>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.continuousListening}
                  onChange={(e) => setSettings(prev => ({ ...prev, continuousListening: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Continuous Listening</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.voiceResponse}
                  onChange={(e) => setSettings(prev => ({ ...prev, voiceResponse: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Voice Responses</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Example Commands */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/10">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Example Commands:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
          <div>• "{settings.activationKeyword} show status"</div>
          <div>• "{settings.activationKeyword} predict eth"</div>
          <div>• "{settings.activationKeyword} start trading"</div>
          <div>• "{settings.activationKeyword} emergency stop"</div>
          <div>• "{settings.activationKeyword} analyze market"</div>
          <div>• "{settings.activationKeyword} portfolio balance"</div>
        </div>
      </div>
    </div>
  );
}