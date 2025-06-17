import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, Signal, History, Settings, Shield, Brain } from "lucide-react";
import KonsPanel from "./KonsPanel";

interface SidebarProps {
  onAdminClick: () => void;
}

export default function Sidebar({ onAdminClick }: SidebarProps) {
  const [currentWisdom, setCurrentWisdom] = useState("");

  // Fetch Kons wisdom
  const { data: wisdomData } = useQuery<{ wisdom: string }>({
    queryKey: ['/api/kons/wisdom'],
    refetchInterval: 60000, // Refresh wisdom every minute
  });

  useEffect(() => {
    if (wisdomData?.wisdom) {
      setCurrentWisdom(wisdomData.wisdom);
    }
  }, [wisdomData]);

  return (
    <div className="w-64 waides-card waides-border border-r flex-shrink-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold waides-text-primary">Waides AI</h1>
            <p className="text-xs waides-text-secondary">ETH Trading Assistant</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 p-3 rounded-lg waides-bg waides-text-primary hover:bg-opacity-50 transition-colors"
          >
            <ChartLine className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 p-3 rounded-lg waides-text-secondary hover:waides-bg hover:waides-text-primary transition-colors"
          >
            <Signal className="w-5 h-5" />
            <span>Signals</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 p-3 rounded-lg waides-text-secondary hover:waides-bg hover:waides-text-primary transition-colors"
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 p-3 rounded-lg waides-text-secondary hover:waides-bg hover:waides-text-primary transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <button
            onClick={onAdminClick}
            className="w-full flex items-center space-x-3 p-3 rounded-lg waides-text-secondary hover:waides-bg hover:waides-text-primary transition-colors text-left"
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </button>
        </nav>
      </div>
      
      <div className="mt-auto">
        <KonsPanel wisdom={currentWisdom} />
      </div>
    </div>
  );
}
