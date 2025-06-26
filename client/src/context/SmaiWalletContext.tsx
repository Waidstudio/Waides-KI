import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'deposit' | 'conversion' | 'trade' | 'withdrawal';
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface SmaiWalletContextType {
  smaiBalance: number;
  localBalance: number;
  transactions: Transaction[];
  isLoading: boolean;
  updateBalance: (smaiAmount: number, localAmount: number) => void;
  addTransaction: (transaction: Transaction) => void;
  fetchWalletData: () => Promise<void>;
  canAffordTrade: (amount: number) => boolean;
  deductTradingBalance: (amount: number) => Promise<boolean>;
  addTradingProfit: (amount: number) => Promise<void>;
}

const SmaiWalletContext = createContext<SmaiWalletContextType | undefined>(undefined);

interface SmaiWalletProviderProps {
  children: ReactNode;
}

export const SmaiWalletProvider = ({ children }: SmaiWalletProviderProps) => {
  const [smaiBalance, setSmaiBalance] = useState(0);
  const [localBalance, setLocalBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch wallet data from backend
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();
      
      if (data.success) {
        setSmaiBalance(data.smaiBalance);
        setLocalBalance(data.localBalance);
      }

      // Fetch transactions
      const transactionsResponse = await fetch('/api/wallet/transactions');
      const transactionsData = await transactionsResponse.json();
      
      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance in context and backend
  const updateBalance = (smaiAmount: number, localAmount: number) => {
    setSmaiBalance(smaiAmount);
    setLocalBalance(localAmount);
  };

  // Add transaction to context
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  // Check if user can afford a trade
  const canAffordTrade = (amount: number): boolean => {
    return smaiBalance >= amount;
  };

  // Deduct balance for trading (with backend sync)
  const deductTradingBalance = async (amount: number): Promise<boolean> => {
    if (!canAffordTrade(amount)) {
      toast({
        title: "Insufficient Balance",
        description: `Need ₭${amount.toFixed(2)} but only have ₭${smaiBalance.toFixed(2)}`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch('/api/wallet/deduct-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSmaiBalance(data.newBalance);
        addTransaction(data.transaction);
        return true;
      } else {
        toast({
          title: "Trading Error",
          description: data.error || "Failed to deduct trading balance",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Trading Error",
        description: "Failed to process trading balance",
        variant: "destructive",
      });
      return false;
    }
  };

  // Add trading profit (with backend sync)
  const addTradingProfit = async (amount: number): Promise<void> => {
    try {
      const response = await fetch('/api/wallet/add-profit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSmaiBalance(data.newBalance);
        addTransaction(data.transaction);
        toast({
          title: "Trading Profit",
          description: `Added ₭${amount.toFixed(2)} from successful trade`,
        });
      }
    } catch (error) {
      console.error('Failed to add trading profit:', error);
    }
  };

  // Load wallet data on mount
  useEffect(() => {
    fetchWalletData();
  }, []);

  const value: SmaiWalletContextType = {
    smaiBalance,
    localBalance,
    transactions,
    isLoading,
    updateBalance,
    addTransaction,
    fetchWalletData,
    canAffordTrade,
    deductTradingBalance,
    addTradingProfit,
  };

  return (
    <SmaiWalletContext.Provider value={value}>
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