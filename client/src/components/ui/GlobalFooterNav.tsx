import { Link } from "wouter";
import { Home, TrendingUp, Wallet, Bot, Settings, Users, Zap } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";

export default function GlobalFooterNav() {
  const { isAuthenticated } = useUserAuth();

  // Only show footer navigation for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <footer className="global-footer-nav fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-2">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-around h-full">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center space-y-0.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Home className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
            <span className="text-xs text-slate-400 group-hover:text-purple-400">Home</span>
          </Link>

          {/* WaidBot Engine */}
          <Link href="/waidbot-engine" className="flex flex-col items-center space-y-0.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Zap className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            <span className="text-xs text-slate-400 group-hover:text-emerald-400">Engine</span>
          </Link>

          {/* Trading */}
          <Link href="/trading" className="flex flex-col items-center space-y-0.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            <span className="text-xs text-slate-400 group-hover:text-emerald-400">Trading</span>
          </Link>

          {/* Portal - Center & Futuristic */}
          <Link href="/portal" className="flex flex-col items-center space-y-0.5 p-1.5 rounded-xl bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-purple-500/30 hover:from-purple-400/40 hover:via-cyan-400/30 hover:to-purple-400/40 transition-all duration-300 group border border-purple-400/50 hover:border-cyan-400/60 shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/30 hover:scale-105 transform">
            <div className="relative">
              <Bot className="w-4 h-4 text-purple-300 group-hover:text-cyan-300 transition-colors duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-xs text-purple-300 group-hover:text-cyan-300 font-bold tracking-wide">PORTAL</span>
          </Link>

          {/* Wallet */}
          <Link href="/wallet" className="flex flex-col items-center space-y-0.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Wallet className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            <span className="text-xs text-slate-400 group-hover:text-blue-400">Wallet</span>
          </Link>

          {/* Forum */}
          <Link href="/forum" className="flex flex-col items-center space-y-0.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Users className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="text-xs text-slate-400 group-hover:text-cyan-400">Forum</span>
          </Link>

          {/* Market Storytelling */}
          <Link href="/market-storytelling" className="flex flex-col items-center space-y-0.5 p-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
            <span className="text-xs text-slate-400 group-hover:text-orange-400">Stories</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}