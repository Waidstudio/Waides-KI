import { Sparkles } from "lucide-react";

interface KonsPanelProps {
  wisdom?: string;
}

export default function KonsPanel({ wisdom }: KonsPanelProps) {
  const defaultWisdom = "The market whispers secrets to those who listen with patience...";
  
  return (
    <div className="p-6 border-t waides-border">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
        <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          Kons Powa
        </h3>
        <p className="text-xs waides-text-secondary italic">
          "{wisdom || defaultWisdom}"
        </p>
      </div>
    </div>
  );
}
