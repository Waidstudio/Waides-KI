import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('waides_auth_token');
  });
  
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Verify token and get user info
  const { data: userData, isLoading: isVerifying, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch('/api/auth/me', {
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
    enabled: !!token,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) => {
      const response = await fetch('/api/auth/login', {
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
      localStorage.setItem('waides_auth_token', data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!token) return;
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSettled: () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('waides_auth_token');
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
      localStorage.removeItem('waides_auth_token');
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

  const value: AuthContextType = {
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}