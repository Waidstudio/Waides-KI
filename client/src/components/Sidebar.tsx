import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, Signal, History, Settings, Shield, Brain, Menu, X } from "lucide-react";
import KonsPanel from "./KonsPanel";

interface SidebarProps {
  onAdminClick: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function Sidebar({ onAdminClick, isCollapsed, onToggle, onNavigate, currentPage = 'dashboard' }: SidebarProps) {
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

  const navigationItems = [
    { id: 'dashboard', icon: ChartLine, label: 'Dashboard' },
    { id: 'signals', icon: Signal, label: 'Signals' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    if (window.innerWidth < 1024) { // Auto-collapse on mobile/tablet
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full z-50 lg:relative lg:z-auto
        waides-card waides-border border-r flex-shrink-0 flex flex-col
        transform transition-all duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:w-20' : 'translate-x-0 w-80 lg:w-64'}
        bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-xl
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 transition-all duration-300 ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="text-white text-lg" />
              </div>
              <div className={`transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Waides AI
                </h1>
                <p className="text-xs waides-text-secondary">ETH Trading Assistant</p>
              </div>
            </div>
            
            {/* Toggle button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5 waides-text-secondary" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border border-green-500/30 shadow-lg' 
                      : 'waides-text-secondary hover:bg-slate-700/30 hover:text-white'
                    }
                    ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* Admin Button */}
            <button
              onClick={() => {
                onAdminClick();
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                waides-text-secondary hover:bg-slate-700/30 hover:text-white border-t border-slate-700/50 mt-4 pt-4
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Admin
              </span>
            </button>
          </nav>
        </div>
        
        {/* Kons Panel */}
        <div className={`mt-auto transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <KonsPanel wisdom={currentWisdom} />
        </div>
      </div>
    </>
  );
}
