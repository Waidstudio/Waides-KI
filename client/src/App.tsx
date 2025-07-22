import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "./lib/utils";
import { Bell, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationBell } from "@/components/NotificationBell";
import StableNavigation from "@/components/ui/StableNavigation";
import ProfessionalLanding from "@/components/ui/ProfessionalLanding";
import ProfessionalWalletPage from "@/pages/ProfessionalWalletPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import Dashboard from "@/pages/dashboard";
import WaidBotPage from "@/pages/waidbot";
import WaidBotProPage from "@/pages/waidbot-pro";
import WaidbotEnginePage from "@/pages/WaidbotEnginePageEnhanced";
import LiveDataPage from "@/pages/LiveDataPage";
import AdminPage from "@/pages/AdminPage";
import AdminPanel from "@/pages/AdminPanel";
import AdminPanelNew from "@/pages/AdminPanelNew";
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
import KonsPowaPage from "@/pages/KonsPowaPage";
import BiometricTradingInterface from "@/components/BiometricTradingInterface";
import InteractiveMarketTrendStorytellingEngine from "@/components/InteractiveMarketTrendStorytellingEngine";
import ExpandedAdminConfigPage from "@/pages/ExpandedAdminConfigPage";
import ForumPage from "@/pages/forum";

import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", label: "Vision Portal" },
    { path: "/wallet", label: "Wallet" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/forum", label: "Cosmic Forum" },
    { path: "/waidbot-engine", label: "Waidbot Engine" },
    { path: "/market-storytelling", label: "Market Stories" },
    { path: "/waidbot", label: "WaidBot" },
    { path: "/waidbot-pro", label: "WaidBot Pro" },
    { path: "/strategy-autogen", label: "Strategy Autogen" },
    { path: "/voice-command", label: "Voice Command" },
    { path: "/kons-powa", label: "KonsPowa Engine" },
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
    { path: "/admin-panel", label: "Admin Panel" },
    { path: "/expanded-config", label: "Expanded Config" },
    { path: "/config", label: "Configuration" },
    { path: "/api-docs", label: "API Docs" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Stable Navigation */}
      <StableNavigation />

      {/* Main Content Area */}
      <main>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          
          {/* Professional Landing Page */}
          <Route path="/" component={ProfessionalLanding} />
          
          {/* Vision Portal - moved to /portal */}
          <Route path="/portal" component={WaidesKIVisionPortal} />
          <Route path="/trading" component={WaidesKIVisionPortal} />
          <Route path="/wallet" component={ProfessionalWalletPage} />
          <Route path="/wallet-simple" component={SmaiSikaWalletPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/forum" component={ForumPage} />
          <Route path="/waidbot" component={WaidBotPage} />
          <Route path="/waidbot-pro" component={WaidBotProPage} />
          <Route path="/live-data" component={LiveDataPage} />
          <Route path="/learning" component={LearningPage} />
          
          {/* Trading protected routes */}
          <Route path="/waidbot-engine">
            {() => (
              <ProtectedRoute requiredPermission="control_trading">
                <WaidbotEnginePage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/strategy-autogen">
            {() => (
              <ProtectedRoute requiredPermission="control_trading">
                <StrategyAutogenPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/enhanced-waidbot">
            {() => (
              <ProtectedRoute requiredPermission="control_trading">
                <EnhancedWaidBotPage />
              </ProtectedRoute>
            )}
          </Route>
          
          {/* Admin protected routes */}
          <Route path="/admin">
            {() => (
              <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                <AdminPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/admin-panel">
            {() => (
              <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                <AdminPanelNew />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/config">
            {() => (
              <ProtectedRoute requiredPermission="update_config">
                <AdminConfigPanel />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/expanded-config">
            {() => (
              <ProtectedRoute requiredRole="super_admin">
                <ExpandedAdminConfigPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/payment-admin">
            {() => (
              <ProtectedRoute requiredPermission="manage_financial">
                <PaymentGatewayAdminPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/sms-config">
            {() => (
              <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                <SMSConfigPage />
              </ProtectedRoute>
            )}
          </Route>
          
          {/* Advanced system routes */}
          <Route path="/market-storytelling" component={InteractiveMarketTrendStorytellingEngine} />
          <Route path="/voice-command" component={VoiceCommandPage} />
          <Route path="/kons-powa">
            {() => (
              <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                <KonsPowaPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/biometric-trading" component={BiometricTradingInterface} />
          <Route path="/profile" component={ProfilePage} />
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
      <AuthProvider>
        <SmaiWalletProvider>
          <TooltipProvider>
            <div className="dark min-h-screen waides-bg">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </SmaiWalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
