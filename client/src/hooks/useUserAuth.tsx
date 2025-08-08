import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

interface AuthResponse {
  success: boolean;
  user: User;
}

export const useUserAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const { data: authData } = useQuery<AuthResponse>({
    queryKey: ['/api/user-auth/me'],
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: false
  });

  useEffect(() => {
    if (authData?.success && authData?.user) {
      setUser(authData.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [authData]);

  const logout = async () => {
    try {
      await fetch('/api/user-auth/logout', { method: 'POST' });
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    logout,
    isLoading: !authData && !user
  };
};