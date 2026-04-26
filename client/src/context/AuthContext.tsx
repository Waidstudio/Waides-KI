import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  lastLogin?: Date;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Backward compatibility export as AuthContext
export { AdminAuthContext as AuthContext };

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const staticMode = import.meta.env.VITE_STATIC_SITE === 'true';
  const [token, setToken] = useState<string | null>(() => {
    return staticMode ? null : localStorage.getItem('waides_admin_auth_token');
  });
  
  const [user, setUser] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();

  // Verify token and get admin user info
  const { data: userData, isLoading: isVerifying, error } = useQuery({
    queryKey: ['admin_auth', 'me'],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch('/api/admin-auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      return data.user;
    },
    enabled: !!token && !staticMode,
    retry: false,
  });

  // Admin login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) => {
      if (staticMode) {
        throw new Error('Admin login requires the Waides KI backend API.');
      }

      const response = await fetch('/api/admin-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('waides_admin_auth_token', data.token);
      queryClient.setQueryData(['admin_auth', 'me'], data.user);
    },
  });

  // Admin logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (staticMode) return;
      if (!token) return;
      
      await fetch('/api/admin-auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSettled: () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('waides_admin_auth_token');
      queryClient.clear();
    },
  });

  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (error && token) {
      // Token is invalid, clear it
      setToken(null);
      localStorage.removeItem('waides_admin_auth_token');
    }
  }, [userData, error, token]);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      await loginMutation.mutateAsync({ email, password, rememberMe });
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const value: AdminAuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading: isVerifying || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout,
    hasPermission,
    hasRole,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Keep the old useAuth for backward compatibility (will be deprecated)
export function useAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Backward compatibility export
export { AdminAuthProvider as AuthProvider };
