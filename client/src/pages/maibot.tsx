import Maibot from "@/components/Maibot";
import PortfolioManager from "@/components/PortfolioManager";

export default function MaibotPage() {
  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <div className="h-8 w-8 text-white text-2xl">🤖</div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                Maibot
                <div className="h-6 w-6 text-blue-400" title="Synced with Engine">🔗</div>
              </h1>
              <p className="text-blue-200">
                Free Trading Assistant - Synchronized with Centralized Engine
              </p>
            </div>
            <div className="ml-auto">
              <div className="text-center">
                <div className="text-sm text-blue-400 font-semibold">TIER: FREE</div>
                <div className="text-xs text-gray-400">Perfect for beginners</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Maibot />
          <PortfolioManager />
        </div>
      </div>
    </div>
  );
}