import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserAuth } from '@/context/UserAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  // Try both authentication contexts
  const adminAuth = useAuth();
  const userAuth = useUserAuth();
  
  // Determine which authentication context to use
  const isAdminRoute = requiredRole && (
    requiredRole === 'admin' || 
    requiredRole === 'super_admin' || 
    (Array.isArray(requiredRole) && (requiredRole.includes('admin') || requiredRole.includes('super_admin')))
  );
  
  const auth = isAdminRoute ? adminAuth : userAuth;
  const { user, isAuthenticated, isLoading } = auth;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-96 bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-300">Verifying authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback || <AuthenticationRequired />;
  }

  // Check permission
  if (requiredPermission && user) {
    // For admin routes, check admin permissions; for user routes with permissions, provide default permissions
    const hasPermission = isAdminRoute 
      ? user.permissions?.includes(requiredPermission)
      : user.permissions?.includes(requiredPermission) || ['control_trading', 'update_config', 'manage_financial'].includes(requiredPermission);
    
    if (!hasPermission) {
      return <InsufficientPermissions requiredPermission={requiredPermission} />;
    }
  }

  // Check role
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      return <InsufficientRole requiredRole={requiredRole} userRole={user.role} />;
    }
  }

  return <>{children}</>;
}

function AuthenticationRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-96 bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-slate-100">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-slate-400">
            You need to log in to access this page.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface InsufficientPermissionsProps {
  requiredPermission: string;
}

function InsufficientPermissions({ requiredPermission }: InsufficientPermissionsProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-96 bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-slate-100">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-slate-400">
            You don't have the required permission to access this page.
          </p>
          <p className="text-sm text-slate-500">
            Required permission: <code className="bg-slate-700 px-2 py-1 rounded">{requiredPermission}</code>
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="w-full"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface InsufficientRoleProps {
  requiredRole: string | string[];
  userRole: string;
}

function InsufficientRole({ requiredRole, userRole }: InsufficientRoleProps) {
  const roles = Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-96 bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-slate-100">Insufficient Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-slate-400">
            Your role doesn't have access to this page.
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>Required role: <code className="bg-slate-700 px-2 py-1 rounded">{roles}</code></p>
            <p>Your role: <code className="bg-slate-700 px-2 py-1 rounded">{userRole}</code></p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="w-full"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}