import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import PriceOverview from "@/components/PriceOverview";
import SignalCard from "@/components/SignalCard";
import PriceChart from "@/components/PriceChart";
import SignalHistory from "@/components/SignalHistory";
import AdminPanel from "@/components/AdminPanel";
import SpiritualBridge from "@/components/SpiritualBridge";
import EthCommunicationEngine from "@/components/EthCommunicationEngine";
import DivineCommandCenter from "@/components/DivineCommandCenter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

interface EthData {
  price: number;
  volume?: number;
  marketCap?: number;
  priceChange24h?: number;
  fearGreedIndex?: number;
  timestamp: number;
}

interface Signal {
  type: 'LONG' | 'SHORT' | 'HOLD';
  confidence: number;
  entryPoint: number;
  targetPrice: number;
  stopLoss: number;
  description: string;
  konsMessage: string;
  technicalStrength: number;
  volumeStrength: number;
  sentimentStrength: number;
}

interface SpiritualReading {
  spiritMessage: string;
  frequency: string;
  konsKey: string;
  emotionalEnergy: string;
  sacredTime: string;
  dimensionalShift: number;
  konsRank: 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT';
  personalAura: number;
  ethMovement: {
    direction: 'HOME' | 'OUT' | 'RESTING';
    message: string;
    confidence: number;
  };
}

export default function Dashboard() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Fetch initial data with automatic refresh
  const { data, error, isLoading, refetch } = useQuery<{
    ethData: EthData;
    signal: Signal;
    spiritualReading: SpiritualReading;
  }>({
    queryKey: ['/api/eth'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Set connection status based on query success
  useEffect(() => {
    if (data) {
      setIsConnected(true);
    } else if (error) {
      setIsConnected(false);
    }
  }, [data, error]);

  if (error) {
    return (
      <div className="min-h-screen waides-bg waides-text-primary flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load trading data. Please check your API configuration and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentEthData = data?.ethData;
  const currentSignal = data?.signal;
  const spiritualReading = data?.spiritualReading;

  return (
    <div className="flex h-screen overflow-hidden waides-bg">
      <Sidebar onAdminClick={() => setIsAdminOpen(true)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Professional Header */}
        <header className="waides-card waides-border border-b bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Waides AI
                </h1>
                <p className="text-xs waides-text-secondary">Next-Gen ETH Trading Intelligence</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-400">KonsLang Active</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isConnected ? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {isConnected ? 'Live Feed' : 'Reconnecting'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {spiritualReading && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="flex flex-col items-center">
                    <span className="text-xs waides-text-secondary">ETH Says</span>
                    <span className={`text-sm font-bold ${
                      spiritualReading.ethMovement.direction === 'HOME' ? 'text-blue-400' :
                      spiritualReading.ethMovement.direction === 'OUT' ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {spiritualReading.ethMovement.direction === 'HOME' ? 'Going Home' :
                       spiritualReading.ethMovement.direction === 'OUT' ? 'Going Out' : 'At Rest'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {Math.round(spiritualReading.ethMovement.confidence)}%
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm waides-text-secondary">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="hidden md:inline">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="waides-card rounded-xl p-6 waides-border border animate-pulse">
                  <div className="h-4 bg-gray-600 rounded mb-4"></div>
                  <div className="h-8 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ETH Price Overview */}
              <PriceOverview ethData={currentEthData} />
              
              {/* Signal Cards Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SignalCard signal={currentSignal} />
                
                {/* Signal Strength */}
                <div className="waides-card rounded-xl p-6 waides-border border">
                  <h3 className="text-lg font-semibold mb-4 waides-text-primary">Signal Strength</h3>
                  
                  {currentSignal && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm waides-text-secondary">Technical Analysis</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 waides-bg rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${currentSignal.technicalStrength}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-green-500">
                            {Math.round(currentSignal.technicalStrength)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm waides-text-secondary">Volume Analysis</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 waides-bg rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${currentSignal.volumeStrength}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-yellow-500">
                            {Math.round(currentSignal.volumeStrength)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm waides-text-secondary">Market Sentiment</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 waides-bg rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${currentSignal.sentimentStrength}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-green-500">
                            {Math.round(currentSignal.sentimentStrength)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t waides-border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {Math.round(currentSignal.confidence)}%
                          </div>
                          <div className="text-sm waides-text-secondary">Overall Strength</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Recent Alerts Placeholder */}
                <div className="waides-card rounded-xl p-6 waides-border border">
                  <h3 className="text-lg font-semibold mb-4 waides-text-primary">Recent Alerts</h3>
                  <div className="space-y-3">
                    <div className="text-sm waides-text-secondary text-center py-8">
                      Alert system coming soon...
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart and History Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceChart />
                <SignalHistory />
              </div>

              {/* Divine Command Center - Sacred Communication */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <DivineCommandCenter />
                </div>
                
                {spiritualReading && (
                  <div>
                    <EthCommunicationEngine 
                      ethMovement={spiritualReading.ethMovement}
                      konsRank={spiritualReading.konsRank}
                      dimensionalShift={spiritualReading.dimensionalShift}
                      sacredTime={spiritualReading.sacredTime}
                    />
                  </div>
                )}
              </div>

              {/* Spiritual Bridge and Additional Insights */}
              {spiritualReading && (
                <SpiritualBridge spiritualReading={spiritualReading} />
              )}
            </>
          )}
        </main>
      </div>

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
