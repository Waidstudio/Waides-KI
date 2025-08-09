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
import { AdminAuthProvider } from "@/context/AuthContext";
import { UserAuthProvider, useUserAuth } from "@/context/UserAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationBell } from "@/components/NotificationBell";
import StableNavigation from "@/components/ui/StableNavigation";
import AdminChatSystem from "@/components/AdminChatSystem";
import GlobalFooterNav from "@/components/ui/GlobalFooterNav";
import ProfessionalLanding from "@/components/ui/ProfessionalLanding";
import HomePage from "@/components/HomePage";
import ProfessionalWalletPage from "@/pages/ProfessionalWalletPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AboutWaidesKI from "@/pages/AboutWaidesKI";
import EnhancedWalletPage from "@/pages/EnhancedWalletPage";
import LoginPage from "@/pages/LoginPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import Dashboard from "@/pages/dashboard";
import MaibotPage from "@/pages/maibot";
import WaidBotPage from "@/pages/waidbot";
import WaidBotProPage from "@/pages/waidbot-pro";
import UnifiedBotDashboardPage from "@/pages/unified-bot-dashboard";
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
import ProfileSettingsPage from "@/pages/ProfileSettingsPage";
import SupportPage from "@/pages/SupportPage";
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
import TradingInterface from "@/components/TradingInterface";
import AdminConfigPanel from "@/components/AdminConfigPanel";
import StrategyAutogenPage from "@/pages/StrategyAutogenPage";
import VoiceCommandPage from "@/pages/VoiceCommandPage";
import SmaiSikaWalletPage from "@/pages/SmaiSikaWalletPage";
import SMSConfigPage from "@/pages/SMSConfigPage";
import PaymentGatewayAdminPage from "@/pages/PaymentGatewayAdminPage";
import AdminExchangePoolPage from "@/pages/AdminExchangePoolPage";
import KonsPowaPage from "@/pages/KonsPowaPage";
import SmaisikaMining from "@/pages/SmaisikaMining";
import SystemValidationDashboard from "@/pages/SystemValidationDashboard";
import BiometricTradingInterface from "@/components/BiometricTradingInterface";
import InteractiveMarketTrendStorytellingEngine from "@/components/InteractiveMarketTrendStorytellingEngine";
import ExpandedAdminConfigPage from "@/pages/ExpandedAdminConfigPage";
import ForumPage from "@/pages/forum";
import CommunityForum from "@/pages/CommunityForum";
import UserDashboard from "@/pages/UserDashboard";
import AISystemsPage from "@/pages/AISystemsPage";
import AutonomousTraderPage from "@/pages/AutonomousTraderPage";
import FullEnginePage from "@/pages/FullEnginePage";
import WaidChatPage from "@/pages/WaidChatPage";

import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/portal", label: "Vision Portal" },
    { path: "/trading", label: "Trading Interface" },
    { path: "/ai-systems", label: "AI Systems" },
    { path: "/wallet", label: "Wallet" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/forum", label: "Cosmic Forum" },
    { path: "/waidbot-engine", label: "Waidbot Engine" },
    { path: "/market-storytelling", label: "Market Stories" },
    { path: "/bot-dashboard", label: "Bot Dashboard" },
    { path: "/maibot", label: "Maibot (Free)" },
    { path: "/waidbot", label: "WaidBot" },
    { path: "/waidbot-pro", label: "WaidBot Pro" },
    { path: "/strategy-autogen", label: "Strategy Autogen" },
    { path: "/voice-command", label: "Voice Command" },
    { path: "/kons-powa", label: "KonsPowa Engine" },
    { path: "/smaisika-mining", label: "SmaiSika Mining" },
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
    { path: "/system-validation", label: "System Validation" },
  ];

  return (
    <div className={`min-h-screen bg-slate-900 ${isAuthenticated ? 'has-footer-nav' : ''}`}>
      {/* Unified Navigation Header */}
      <StableNavigation />

      {/* Main Content Area */}
      <main className="pb-16">
        <Switch>
          {/* Authentication Routes */}
          <Route path="/login" component={LoginPage} />
          <Route path="/admin-login" component={AdminLoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          
          {/* Professional Landing Page - Only for non-authenticated users */}
          <Route path="/" component={HomePage} />
          
          {/* About Waides KI - Comprehensive platform guide */}
          <Route path="/about" component={AboutWaidesKI} />
          
          {/* Protected Core Routes */}
          <Route path="/portal">
            {() => (
              <ProtectedRoute>
                <WaidesKIVisionPortal />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/trading">
            {() => (
              <ProtectedRoute>
                <TradingInterface />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/ai-systems">
            {() => (
              <ProtectedRoute>
                <AISystemsPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/wallet">
            {() => (
              <ProtectedRoute>
                <EnhancedWalletPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/wallet-simple">
            {() => (
              <ProtectedRoute>
                <SmaiSikaWalletPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/wallet-pro">
            {() => (
              <ProtectedRoute>
                <ProfessionalWalletPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/analytics">
            {() => (
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/forum">
            {() => (
              <ProtectedRoute>
                <CommunityForum />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/waidchat">
            {() => (
              <ProtectedRoute>
                <WaidChatPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/bot-dashboard">
            {() => (
              <ProtectedRoute>
                <UnifiedBotDashboardPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/maibot">
            {() => (
              <ProtectedRoute>
                <MaibotPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/waidbot">
            {() => (
              <ProtectedRoute>
                <WaidBotPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/waidbot-pro">
            {() => (
              <ProtectedRoute>
                <WaidBotProPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/live-data">
            {() => (
              <ProtectedRoute>
                <LiveDataPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/learning">
            {() => (
              <ProtectedRoute>
                <LearningPage />
              </ProtectedRoute>
            )}
          </Route>
          
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
          <Route path="/autonomous-trader">
            {() => (
              <ProtectedRoute requiredPermission="control_trading">
                <AutonomousTraderPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/full-engine">
            {() => (
              <ProtectedRoute requiredPermission="control_trading">
                <FullEnginePage />
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
          <Route path="/admin-exchange-pool">
            {() => (
              <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                <AdminExchangePoolPage />
              </ProtectedRoute>
            )}
          </Route>
          
          {/* Advanced system routes */}
          <Route path="/market-storytelling">
            {() => (
              <ProtectedRoute>
                <InteractiveMarketTrendStorytellingEngine />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/voice-command">
            {() => (
              <ProtectedRoute>
                <VoiceCommandPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/kons-powa">
            {() => (
              <ProtectedRoute requiredRole={["admin", "super_admin"]}>
                <KonsPowaPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/smaisika-mining">
            {() => (
              <ProtectedRoute>
                <SmaisikaMining />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/biometric-trading">
            {() => (
              <ProtectedRoute>
                <BiometricTradingInterface />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/profile">
            {() => (
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/settings">
            {() => (
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/support">
            {() => (
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/analytics">
            {() => (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/security">
            {() => (
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/vision-portal">
            {() => (
              <ProtectedRoute>
                <WaidesKIVisionPortal />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/ml-lifecycle">
            {() => (
              <ProtectedRoute>
                <MLLifecycleManager />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/risk-backtesting">
            {() => (
              <ProtectedRoute>
                <RiskScenarioBacktesting />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/reincarnation">
            {() => (
              <ProtectedRoute>
                <ReincarnationLoop />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/spiritual-recall">
            {() => (
              <ProtectedRoute>
                <SpiritualRecall />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/seasonal-rebirth">
            {() => (
              <ProtectedRoute>
                <SeasonalRebirth />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/sigil-layer">
            {() => (
              <ProtectedRoute>
                <SigilLayer />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/shadow-defense">
            {() => (
              <ProtectedRoute>
                <ShadowOverrideDefense />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dream-vision">
            {() => (
              <ProtectedRoute>
                <DreamLayerVision />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/vision-spirit">
            {() => (
              <ProtectedRoute>
                <VisionSpiritPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/eth-empath-guardian">
            {() => (
              <ProtectedRoute>
                <ETHEmpathNetworkGuardian />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/meta-guardian">
            {() => (
              <ProtectedRoute>
                <MetaGuardianNetwork />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/full-engine">
            {() => (
              <ProtectedRoute>
                <WaidesFullEngine />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/gateway">
            {() => (
              <ProtectedRoute>
                <GatewayPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/api-docs">
            {() => (
              <ProtectedRoute>
                <APIDocsPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/autonomous-wealth">
            {() => (
              <ProtectedRoute>
                <AutonomousWealthEngine />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/system-validation">
            {() => (
              <ProtectedRoute>
                <SystemValidationDashboard />
              </ProtectedRoute>
            )}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Global Footer Navigation */}
      <GlobalFooterNav />
      
      {/* Admin Chat System - Available for all authenticated users */}
      {isAuthenticated && (
        <AdminChatSystem 
          isAdmin={user?.role === 'admin' || user?.role === 'super_admin'} 
          userId={user?.id?.toString() || '1'} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <SmaiWalletProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Router />
                <Toaster />
              </div>
            </SmaiWalletProvider>
          </UserAuthProvider>
        </AdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
