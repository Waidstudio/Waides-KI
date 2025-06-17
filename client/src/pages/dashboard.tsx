import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import PriceOverview from "@/components/PriceOverview";
import SignalCard from "@/components/SignalCard";
import PriceChart from "@/components/PriceChart";
import SignalHistory from "@/components/SignalHistory";
import AdminPanel from "@/components/AdminPanel";
import SpiritualBridge from "@/components/SpiritualBridge";
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
        {/* Header */}
        <header className="waides-card waides-border border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold waides-text-primary">ETH Trading Dashboard</h2>
              <div className="flex items-center space-x-2 text-sm waides-text-secondary">
                <div 
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} 
                />
                <span>{isConnected ? 'Live Data' : 'Disconnected'}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm waides-text-secondary">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
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

              {/* Spiritual Bridge Section */}
              {spiritualReading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <SpiritualBridge spiritualReading={spiritualReading} />
                  </div>
                  
                  {/* Spiritual Stats */}
                  <div className="waides-card rounded-xl p-6 waides-border border">
                    <h4 className="text-lg font-semibold mb-4 waides-text-primary">Spiritual Status</h4>
                    
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-300">
                          {spiritualReading.konsRank}
                        </div>
                        <div className="text-sm waides-text-secondary">Current Rank</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm waides-text-secondary">Sacred Time Active</span>
                          <span className={`text-sm font-medium ${
                            spiritualReading.sacredTime !== 'mundane_time' ? 'text-purple-400' : 'text-gray-400'
                          }`}>
                            {spiritualReading.sacredTime !== 'mundane_time' ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm waides-text-secondary">Energy Level</span>
                          <span className="text-sm font-medium text-yellow-400">
                            {Math.round(spiritualReading.dimensionalShift)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm waides-text-secondary">Aura Resonance</span>
                          <span className="text-sm font-medium text-blue-400">
                            {Math.round(spiritualReading.personalAura)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t waides-border">
                        <div className="text-xs waides-text-secondary text-center">
                          Spiritual bridge actively enhancing signal analysis
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
