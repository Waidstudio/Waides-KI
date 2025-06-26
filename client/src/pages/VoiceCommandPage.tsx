import { useState } from 'react';
import { Mic, Brain, Zap, TrendingUp, Shield, Settings, Volume2, Activity } from 'lucide-react';
import VoiceInterface from '@/components/VoiceInterface';
import { useQuery } from '@tanstack/react-query';

export default function VoiceCommandPage() {
  const [activeTab, setActiveTab] = useState('interface');

  // Voice status query
  const { data: voiceStatus } = useQuery({
    queryKey: ['/api/voice/status'],
    refetchInterval: 5000
  });

  // Voice sessions query
  const { data: voiceSessions } = useQuery({
    queryKey: ['/api/voice/sessions'],
    refetchInterval: 10000
  });

  const tabs = [
    { id: 'interface', label: 'Voice Interface', icon: Mic },
    { id: 'analytics', label: 'Voice Analytics', icon: TrendingUp },
    { id: 'sessions', label: 'Active Sessions', icon: Brain },
    { id: 'settings', label: 'Voice Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Mic className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voice Command Center</h1>
              <p className="text-gray-400">Advanced hands-free trading control system</p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">System Status</span>
              </div>
              <div className="text-white font-medium">
                {voiceStatus?.systemStatus === 'online' ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Active Sessions</span>
              </div>
              <div className="text-white font-medium">{voiceStatus?.activeSessions || 0}</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">Commands Processed</span>
              </div>
              <div className="text-white font-medium">{voiceStatus?.totalCommands || 0}</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Processor Status</span>
              </div>
              <div className="text-white font-medium">
                {voiceStatus?.voiceProcessorAvailable ? 'Advanced' : 'Basic'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'interface' && (
            <div>
              <VoiceInterface />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                  Command Analytics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-emerald-400 font-medium">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Response Time</span>
                    <span className="text-cyan-400 font-medium">0.8s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Recognition Accuracy</span>
                    <span className="text-purple-400 font-medium">97.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Most Used Command</span>
                    <span className="text-yellow-400 font-medium">show status</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                  Voice Patterns
                </h3>
                
                <div className="space-y-3">
                  {voiceStatus?.supportedPatterns?.slice(0, 6).map((pattern: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{pattern.replace(/_/g, ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{Math.floor(Math.random() * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Active Voice Sessions
              </h3>
              
              {voiceSessions?.sessions?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active voice sessions. Start a conversation to see session data.
                </div>
              ) : (
                <div className="space-y-4">
                  {voiceSessions?.sessions?.map((session: any, index: number) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-white font-medium">Session {session.sessionId}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(session.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Commands: </span>
                          <span className="text-cyan-400">{session.commandCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Activity: </span>
                          <span className="text-purple-400">
                            {new Date(session.lastActivity).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-yellow-400" />
                  Voice Recognition Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Language</label>
                    <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none">
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sensitivity</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      defaultValue="7"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">Continuous listening</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">Voice feedback</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-300">Background noise filtering</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-cyan-400" />
                  Audio Output Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Voice Type</label>
                    <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none">
                      <option value="female">Female Voice</option>
                      <option value="male">Male Voice</option>
                      <option value="robotic">Robotic Voice</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Speech Rate</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Quiet</span>
                      <span>Loud</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Command Reference */}
        <div className="mt-8 bg-gray-800/30 rounded-lg p-6 border border-gray-600/10">
          <h3 className="text-lg font-semibold text-white mb-4">Voice Command Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Trading Commands</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>"waides start trading"</li>
                <li>"waides stop trading"</li>
                <li>"waides emergency stop"</li>
                <li>"waides check balance"</li>
              </ul>
            </div>
            <div>
              <h4 className="text-cyan-400 font-medium mb-2">Analysis Commands</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>"waides predict eth"</li>
                <li>"waides analyze market"</li>
                <li>"waides show signals"</li>
                <li>"waides market summary"</li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">System Commands</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>"waides show status"</li>
                <li>"waides help"</li>
                <li>"waides reset system"</li>
                <li>"waides save settings"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}