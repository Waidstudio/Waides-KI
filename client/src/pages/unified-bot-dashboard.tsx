import UnifiedBotDashboard from "@/components/UnifiedBotDashboard";

export default function UnifiedBotDashboardPage() {
  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bot Hierarchy Management
          </h1>
          <p className="text-blue-200">
            Central command center for all 6 trading entities • Subscription-based access control
          </p>
        </div>
        
        <UnifiedBotDashboard />
      </div>
    </div>
  );
}