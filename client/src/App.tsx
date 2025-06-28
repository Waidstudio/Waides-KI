import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "./lib/utils";
import { Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SmaiWalletProvider } from "@/context/SmaiWalletContext";
import Dashboard from "@/pages/dashboard";
import WaidBotPage from "@/pages/waidbot";
import WaidBotProPage from "@/pages/waidbot-pro";
import WaidbotEnginePage from "@/pages/WaidbotEnginePageEnhanced";
import LiveDataPage from "@/pages/LiveDataPage";
import AdminPanel from "@/pages/AdminPanel";
import APIDocsPage from "@/pages/APIDocsPage";
import GatewayPage from "@/pages/GatewayPage";
import LearningPage from "@/pages/learning";
import EnhancedWaidBotPage from "@/pages/enhanced-waidbot";
import ProfilePage from "@/pages/profile";
import AutonomousWealthEngine from "@/components/AutonomousWealthEngine";
import { ReincarnationLoop } from "@/components/ReincarnationLoop";
import { SigilLayer } from "@/components/SigilLayer";
import { ShadowOverrideDefense } from "@/components/ShadowOverrideDefense";
import DreamLayerVision from "@/components/DreamLayerVision";
import { VisionSpiritPage } from "@/components/VisionSpiritPage";
import { SpiritualRecall } from "@/components/SpiritualRecall";
import SeasonalRebirth from "@/components/SeasonalRebirth";
import { ETHEmpathNetworkGuardian } from "@/components/ETHEmpathNetworkGuardian";
import MetaGuardianNetwork from "@/components/MetaGuardianNetwork";
import WaidesFullEngine from "@/components/WaidesFullEngine";
import RiskScenarioBacktesting from "@/components/RiskScenarioBacktesting";
import MLLifecycleManager from "@/components/MLLifecycleManager";
import WaidesKIVisionPortal from "@/components/WaidesKIVisionPortal";
import AdminConfigPanel from "@/components/AdminConfigPanel";
import StrategyAutogenPage from "@/pages/StrategyAutogenPage";
import VoiceCommandPage from "@/pages/VoiceCommandPage";
import SmaiSikaWalletPage from "@/pages/SmaiSikaWalletPage";
import SMSConfigPage from "@/pages/SMSConfigPage";
import PaymentGatewayAdminPage from "@/pages/PaymentGatewayAdminPage";
import BiometricTradingInterface from "@/components/BiometricTradingInterface";
import InteractiveMarketTrendStorytellingEngine from "@/components/InteractiveMarketTrendStorytellingEngine";

import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Vision Portal" },
    { path: "/wallet", label: "Wallet" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/waidbot-engine", label: "Waidbot Engine" },
    { path: "/market-storytelling", label: "Market Stories" },
    { path: "/waidbot", label: "WaidBot" },
    { path: "/waidbot-pro", label: "WaidBot Pro" },
    { path: "/strategy-autogen", label: "Strategy Autogen" },
    { path: "/voice-command", label: "Voice Command" },

    { path: "/live-data", label: "Live Data" },
    { path: "/learning", label: "Trading Academy" },
    { path: "/dream-vision", label: "Dream Vision" },
    { path: "/vision-spirit", label: "Vision Spirit" },
    { path: "/spiritual-recall", label: "Spiritual Recall" },
    { path: "/seasonal-rebirth", label: "Seasonal Rebirth" },
    { path: "/sigil-layer", label: "Sigil Layer" },
    { path: "/shadow-defense", label: "Shadow Defense" },
    { path: "/reincarnation", label: "Reincarnation" },
    { path: "/eth-empath-guardian", label: "ETH Guardian" },
    { path: "/meta-guardian", label: "Meta-Guardian" },
    { path: "/full-engine", label: "Full Engine" },
    { path: "/ml-lifecycle", label: "ML Lifecycle" },
    { path: "/risk-backtesting", label: "Risk Backtesting" },
    { path: "/gateway", label: "Gateway" },
    { path: "/admin", label: "Admin" },
    { path: "/config", label: "Configuration" },
    { path: "/api-docs", label: "API Docs" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <h1 className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors cursor-pointer">
                  Waides KI
                </h1>
              </Link>
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

            {/* Right side - Notifications and User Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-slate-400 hover:text-slate-100 hover:bg-slate-700"
              >
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 bg-red-500"
                >
                  3
                </Badge>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile & Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/biometric-trading" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Trading Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/full-engine" className="cursor-pointer">
                      <span className="mr-2">💰</span>
                      <span>SmaiSika Wallet</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-400 cursor-pointer">
                    <span className="mr-2">🚪</span>
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Switch>
          <Route path="/" component={WaidesKIVisionPortal} />
          <Route path="/wallet" component={SmaiSikaWalletPage} />
          <Route path="/biometric-trading" component={BiometricTradingInterface} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/live-data" component={LiveDataPage} />
          <Route path="/waidbot-engine" component={WaidbotEnginePage} />
          <Route path="/market-storytelling" component={InteractiveMarketTrendStorytellingEngine} />
          <Route path="/waidbot" component={WaidBotPage} />
          <Route path="/waidbot-pro" component={WaidBotProPage} />
          <Route path="/strategy-autogen" component={StrategyAutogenPage} />
          <Route path="/voice-command" component={VoiceCommandPage} />
          <Route path="/enhanced-waidbot" component={EnhancedWaidBotPage} />

          <Route path="/learning" component={LearningPage} />
          <Route path="/ml-lifecycle" component={MLLifecycleManager} />
          <Route path="/risk-backtesting" component={RiskScenarioBacktesting} />
          <Route path="/reincarnation" component={ReincarnationLoop} />
          <Route path="/spiritual-recall" component={SpiritualRecall} />
          <Route path="/seasonal-rebirth" component={SeasonalRebirth} />
          <Route path="/sigil-layer" component={SigilLayer} />
          <Route path="/shadow-defense" component={ShadowOverrideDefense} />
          <Route path="/dream-vision" component={DreamLayerVision} />
          <Route path="/vision-spirit" component={VisionSpiritPage} />
          <Route path="/eth-empath-guardian" component={ETHEmpathNetworkGuardian} />
          <Route path="/meta-guardian" component={MetaGuardianNetwork} />
          <Route path="/full-engine" component={WaidesFullEngine} />
          <Route path="/gateway" component={GatewayPage} />
          <Route path="/sms-config" component={SMSConfigPage} />
          <Route path="/payment-admin" component={PaymentGatewayAdminPage} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/config" component={AdminConfigPanel} />
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
      <SmaiWalletProvider>
        <TooltipProvider>
          <div className="dark min-h-screen waides-bg">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </SmaiWalletProvider>
    </QueryClientProvider>
  );
}

export default App;
