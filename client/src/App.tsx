import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "./lib/utils";
import Dashboard from "@/pages/dashboard";
import WaidBotPage from "@/pages/waidbot";
import WaidBotProPage from "@/pages/waidbot-pro";
import LiveDataPage from "@/pages/LiveDataPage";
import AdminPage from "@/pages/AdminPage";
import APIDocsPage from "@/pages/APIDocsPage";
import GatewayPage from "@/pages/GatewayPage";
import { ReincarnationLoop } from "@/components/ReincarnationLoop";
import { SigilLayer } from "@/components/SigilLayer";
import { ShadowOverrideDefense } from "@/components/ShadowOverrideDefense";
import DreamLayerVision from "@/components/DreamLayerVision";
import VisionSpirit from "@/components/VisionSpirit";
import { SpiritualRecall } from "@/components/SpiritualRecall";
import SeasonalRebirth from "@/components/SeasonalRebirth";
import { ETHEmpathNetworkGuardian } from "@/components/ETHEmpathNetworkGuardian";
import MetaGuardianNetwork from "@/components/MetaGuardianNetwork";
import WaidesFullEngine from "@/components/WaidesFullEngine";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/live-data", label: "Live Data" },
    { path: "/waidbot", label: "WaidBot" },
    { path: "/waidbot-pro", label: "WaidBot Pro" },
    { path: "/reincarnation", label: "Reincarnation" },
    { path: "/spiritual-recall", label: "Spiritual Recall" },
    { path: "/seasonal-rebirth", label: "Seasonal Rebirth" },
    { path: "/sigil-layer", label: "Sigil Layer" },
    { path: "/shadow-defense", label: "Shadow Defense" },
    { path: "/dream-vision", label: "Dream Vision" },
    { path: "/vision-spirit", label: "Vision Spirit" },
    { path: "/eth-empath-guardian", label: "ETH Guardian" },
    { path: "/meta-guardian", label: "Meta-Guardian" },
    { path: "/full-engine", label: "Full Engine" },
    { path: "/gateway", label: "Gateway" },
    { path: "/admin", label: "Admin" },
    { path: "/api-docs", label: "API Docs" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-slate-100">Waides KI</h1>
              <div className="hidden lg:flex space-x-6">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 pt-1 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                        location === item.path
                          ? "border-blue-500 text-slate-100"
                          : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
              
              {/* Mobile navigation */}
              <div className="lg:hidden">
                <select 
                  value={location}
                  onChange={(e) => window.location.href = e.target.value}
                  className="bg-slate-700 text-slate-100 border-slate-600 rounded px-3 py-1 text-sm"
                >
                  {navItems.map((item) => (
                    <option key={item.path} value={item.path}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/live-data" component={LiveDataPage} />
          <Route path="/waidbot" component={WaidBotPage} />
          <Route path="/waidbot-pro" component={WaidBotProPage} />
          <Route path="/reincarnation" component={ReincarnationLoop} />
          <Route path="/spiritual-recall" component={SpiritualRecall} />
          <Route path="/sigil-layer" component={SigilLayer} />
          <Route path="/shadow-defense" component={ShadowOverrideDefense} />
          <Route path="/dream-vision" component={DreamLayerVision} />
          <Route path="/vision-spirit" component={VisionSpirit} />
          <Route path="/eth-empath-guardian" component={ETHEmpathNetworkGuardian} />
          <Route path="/meta-guardian" component={MetaGuardianNetwork} />
          <Route path="/full-engine" component={WaidesFullEngine} />
          <Route path="/gateway" component={GatewayPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/api-docs" component={APIDocsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen waides-bg">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
