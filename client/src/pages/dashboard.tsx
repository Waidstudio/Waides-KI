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
import CandlestickChart from "@/components/CandlestickChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff, Menu } from "lucide-react";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // You can add routing logic here later
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden waides-bg">
      <Sidebar 
        onAdminClick={() => setIsAdminOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile-First Enhanced Header */}
        <header className="waides-card waides-border border-b bg-gradient-to-r from-slate-950/95 to-slate-900/95 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4 lg:px-6">
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <Menu className="w-5 h-5 waides-text-secondary" />
              </button>
              
              {/* Header Title & Status */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Waides AI
                  </h1>
                  <p className="text-xs waides-text-secondary hidden lg:block">Next-Gen ETH Trading Intelligence</p>
                </div>
                
                {/* Status Indicators */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-400 hidden sm:inline">KonsLang</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    <span className={`text-xs font-medium hidden sm:inline ${
                      isConnected ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* ETH Movement Display */}
              {spiritualReading && (
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
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
              
              {/* Connection Status & Time */}
              <div className="flex items-center space-x-2 text-sm waides-text-secondary">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="hidden lg:inline font-mono text-xs">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          <div className="p-4 lg:p-8 space-y-8 max-w-full">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div>
                    <h3 className="text-lg font-semibold waides-text-primary mb-2">Loading Divine Intelligence</h3>
                    <p className="waides-text-secondary">Connecting to ETH spiritual layer and fetching sacred data...</p>
                  </div>
                </div>
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
                
                {/* Real-time Candlestick Chart */}
                <CandlestickChart symbol="ETHUSDT" interval="1m" limit={50} />
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
          </div>
        </main>
      </div>

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
