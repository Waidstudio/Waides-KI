import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface KonsMeshWallet {
  id: number;
  userId: number;
  usdBalance: string;
  smaiSikaBalance: string;
  accountMode: 'demo' | 'real';
  isActive: boolean;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SmaiWalletData {
  // KonsMesh canonical data
  wallet: KonsMeshWallet | null;
  
  // Legacy format for backward compatibility
  smaiSika: {
    available: number;
    locked: number;
    pending: number;
    total: number;
  };
  localCurrencies: Record<string, number>;
  conversionRates: Record<string, number>;
  totalValueInUSD: number;
  lastUpdated: string;
  
  // Enhanced wallet data
  localBalance: number;
  localCurrency: string;
  smaiBalance: number;
  hasConverted: boolean;
}

interface ConversionRequest {
  usdAmount: number;
  rate: number;
}

interface BotFundingRequest {
  botId: string;
  smaiSikaAmount: number;
}

interface SmaiWalletContextType {
  walletData: SmaiWalletData | null;
  isLoading: boolean;
  refreshWallet: () => void;
  convertToSmaiSika: (request: ConversionRequest) => Promise<any>;
  fundBot: (request: BotFundingRequest) => Promise<any>;
  switchAccountMode: (mode: 'demo' | 'real', mfaToken?: string) => Promise<any>;
  isConverting: boolean;
  isFunding: boolean;
  isSwitching: boolean;
}

const SmaiWalletContext = createContext<SmaiWalletContextType | undefined>(undefined);

export const SmaiWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Primary KonsMesh wallet data
  const { data: konsMeshData, isLoading: isKonsMeshLoading, refetch: refetchKonsMesh } = useQuery({
    queryKey: ['/api/konsmesh/wallet'],
    retry: false,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fallback wallet data for compatibility
  const { data: fallbackData, isLoading: isFallbackLoading, refetch: refetchFallback } = useQuery({
    queryKey: ['/api/wallet/balance'],
    enabled: !(konsMeshData as any)?.success, // Only fetch if KonsMesh data is unavailable
    refetchInterval: 10000,
  });

  // Convert USD to SmaiSika
  const convertMutation = useMutation({
    mutationFn: async (request: ConversionRequest) => {
      const response = await fetch('/api/konsmesh/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/konsmesh/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
    },
  });

  // Fund bot with SmaiSika
  const fundBotMutation = useMutation({
    mutationFn: async (request: BotFundingRequest) => {
      const response = await fetch('/api/konsmesh/fund-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/konsmesh/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
    },
  });

  // Switch account mode
  const switchModeMutation = useMutation({
    mutationFn: async ({ mode, mfaToken }: { mode: 'demo' | 'real'; mfaToken?: string }) => {
      const response = await fetch('/api/konsmesh/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMode: mode, mfaToken }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/konsmesh/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
    },
  });

  // Transform data for context
  const walletData: SmaiWalletData | null = React.useMemo(() => {
    const baseData: any = (konsMeshData as any)?.success ? konsMeshData : fallbackData;
    
    if (!baseData) return null;

    const localBalance = baseData.localBalance || baseData.balance || 0;
    const smaiBalance = baseData.smaiBalance || 0;
    const wallet = (konsMeshData as any)?.wallet || null;

    return {
      // KonsMesh canonical data
      wallet,
      
      // Legacy format
      smaiSika: {
        available: smaiBalance,
        locked: 0,
        pending: 0,
        total: smaiBalance,
      },
      localCurrencies: {
        USD: localBalance,
      },
      conversionRates: {
        'USD-SS': 1.0,
      },
      totalValueInUSD: (localBalance + smaiBalance),
      lastUpdated: new Date().toISOString(),
      
      // Enhanced data
      localBalance,
      localCurrency: baseData.localCurrency || 'USD',
      smaiBalance,
      hasConverted: smaiBalance > 0,
    };
  }, [konsMeshData, fallbackData]);

  const refreshWallet = () => {
    refetchKonsMesh();
    refetchFallback();
  };

  const convertToSmaiSika = async (request: ConversionRequest) => {
    return convertMutation.mutateAsync(request);
  };

  const fundBot = async (request: BotFundingRequest) => {
    return fundBotMutation.mutateAsync(request);
  };

  const switchAccountMode = async (mode: 'demo' | 'real', mfaToken?: string) => {
    return switchModeMutation.mutateAsync({ mode, mfaToken });
  };

  return (
    <SmaiWalletContext.Provider
      value={{
        walletData,
        isLoading: isKonsMeshLoading || isFallbackLoading,
        refreshWallet,
        convertToSmaiSika,
        fundBot,
        switchAccountMode,
        isConverting: convertMutation.isPending,
        isFunding: fundBotMutation.isPending,
        isSwitching: switchModeMutation.isPending,
      }}
    >
      {children}
    </SmaiWalletContext.Provider>
  );
};

export const useSmaiWallet = (): SmaiWalletContextType => {
  const context = useContext(SmaiWalletContext);
  if (context === undefined) {
    throw new Error('useSmaiWallet must be used within a SmaiWalletProvider');
  }
  return context;
};

export default SmaiWalletContext;