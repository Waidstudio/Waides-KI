import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SmaiWalletData {
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
}

interface SmaiWalletContextType {
  walletData: SmaiWalletData | null;
  isLoading: boolean;
  refreshWallet: () => void;
}

const SmaiWalletContext = createContext<SmaiWalletContextType | undefined>(undefined);

export const SmaiWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: walletData, isLoading, refetch } = useQuery<SmaiWalletData>({
    queryKey: ['/api/wallet/smaisika/balance'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const refreshWallet = () => {
    refetch();
  };

  return (
    <SmaiWalletContext.Provider
      value={{
        walletData: walletData || null,
        isLoading,
        refreshWallet,
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