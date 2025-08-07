import Maibot from "@/components/Maibot";
import PortfolioManager from "@/components/PortfolioManager";

export default function MaibotPage() {
  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Maibot - Free Trading Assistant
          </h1>
          <p className="text-blue-200">
            Perfect for beginners • Start your trading journey with AI guidance • Manual approval required
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Maibot />
          <PortfolioManager />
        </div>
      </div>
    </div>
  );
}