import { useUserAuth } from "@/context/UserAuthContext";
import ProfessionalLanding from "@/components/ui/ProfessionalLanding";
import UserDashboard from "@/pages/dashboard";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useUserAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  // If authenticated, show dashboard; otherwise show landing page
  if (isAuthenticated) {
    return <UserDashboard />;
  }

  return <ProfessionalLanding />;
}