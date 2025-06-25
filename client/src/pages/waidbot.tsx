import WaidBotEngine from "@/components/WaidBotEngine";
import PortfolioManager from "@/components/PortfolioManager";

export default function WaidBotPage() {
  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <WaidBotEngine />
          <PortfolioManager />
        </div>
      </div>
    </div>
  );
}