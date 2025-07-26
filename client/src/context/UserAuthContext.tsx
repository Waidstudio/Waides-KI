import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user';
  permissions: string[];
  moralityScore?: number;
  spiritualAlignment?: number;
  createdAt?: Date;
}

interface UserAuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

interface UserAuthProviderProps {
  children: ReactNode;
}

export function UserAuthProvider({ children }: UserAuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('waides_user_auth_token');
  });
  
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Verify token and get user info
  const { data: userData, isLoading: isVerifying, error } = useQuery({
    queryKey: ['user_auth', 'me'],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch('/api/user-auth/me', {
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
    staleTime: Infinity, // Never consider data stale - persistent session
    cacheTime: Infinity, // Cache indefinitely
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) => {
      const response = await fetch('/api/user-auth/login', {
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
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('waides_user_auth_token', data.token);
        queryClient.setQueryData(['user_auth', 'me'], data.user);
        // Force re-fetch user data to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['user_auth', 'me'] });
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ username, email, password, confirmPassword }: { username: string; email: string; password: string; confirmPassword: string }) => {
      const response = await fetch('/api/user-auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('waides_user_auth_token', data.token);
        queryClient.setQueryData(['user_auth', 'me'], data.user);
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!token) return;
      
      await fetch('/api/user-auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    onSettled: () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('waides_user_auth_token');
      queryClient.clear();
    },
  });

  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (error && token) {
      // On authentication error, clear the invalid token and logout
      console.log('Authentication error - clearing invalid token:', error);
      setToken(null);
      setUser(null);
      localStorage.removeItem('waides_user_auth_token');
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

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      await registerMutation.mutateAsync({ username, email, password, confirmPassword });
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registration failed' 
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

  const value: UserAuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading: isVerifying || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    login,
    register,
    logout,
    hasPermission,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}