import { Link } from "wouter";
import { Home, TrendingUp, Wallet, Bot, Settings, Users } from "lucide-react";

export default function GlobalFooterNav() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-4 py-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-around">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Home className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
            <span className="text-xs text-slate-400 group-hover:text-purple-400">Home</span>
          </Link>

          {/* Portal */}
          <Link href="/portal" className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Bot className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
            <span className="text-xs text-slate-400 group-hover:text-purple-400">Portal</span>
          </Link>

          {/* Trading */}
          <Link href="/trading" className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            <span className="text-xs text-slate-400 group-hover:text-emerald-400">Trading</span>
          </Link>

          {/* Wallet */}
          <Link href="/wallet" className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Wallet className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
            <span className="text-xs text-slate-400 group-hover:text-blue-400">Wallet</span>
          </Link>

          {/* Forum */}
          <Link href="/forum" className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Users className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="text-xs text-slate-400 group-hover:text-cyan-400">Forum</span>
          </Link>

          {/* Settings */}
          <Link href="/config" className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
            <span className="text-xs text-slate-400 group-hover:text-orange-400">Config</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}