import WaidBotEngine from "@/components/WaidBotEngine";

export default function WaidBotPage() {
  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold waides-text-primary mb-2">
            WaidBot KonsLang Engine
          </h1>
          <p className="waides-text-secondary">
            Autonomous ETH3L/ETH3S spot trading powered by KonsLang artificial intelligence
          </p>
        </div>
        
        <WaidBotEngine />
      </div>
    </div>
  );
}