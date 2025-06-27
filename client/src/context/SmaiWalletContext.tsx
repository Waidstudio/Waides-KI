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
  lockedForTrade: number;
  karmaScore: number;
  tradeEnergy: number;
  lockedUntil: string | null;
  moralIndicator: 'ethical' | 'neutral' | 'blocked';
  divineApproval: boolean;
  smaiPrintAuthorized: boolean;
  transactions: Transaction[];
  isLoading: boolean;
  updateBalance: (smaiAmount: number, localAmount: number) => void;
  addTransaction: (transaction: Transaction) => void;
  fetchWalletData: () => Promise<void>;
  canAffordTrade: (amount: number) => boolean;
  deductTradingBalance: (amount: number) => Promise<boolean>;
  addTradingProfit: (amount: number) => Promise<void>;
  // New Konsmic Intelligence features
  lockTradeFunds: (amount: number) => Promise<boolean>;
  unlockTradeFunds: (amount: number) => Promise<boolean>;
  updateKarma: (result: 'profit' | 'loss', amount: number) => void;
  chargeTradeEnergy: (amount: number) => boolean;
  consumeTradeEnergy: (amount: number) => boolean;
  isTradeAllowed: () => boolean;
  requestDivineApproval: (tradeAmount: number) => Promise<boolean>;
  checkMoralAlignment: (tradeType: string) => 'ethical' | 'neutral' | 'blocked';
  setTimeLock: (unlockDate: string) => void;
  clearTimeLock: () => void;
}

const SmaiWalletContext = createContext<SmaiWalletContextType | undefined>(undefined);

interface SmaiWalletProviderProps {
  children: ReactNode;
}

export const SmaiWalletProvider = ({ children }: SmaiWalletProviderProps) => {
  const [smaiBalance, setSmaiBalance] = useState(0);
  const [localBalance, setLocalBalance] = useState(0);
  const [lockedForTrade, setLockedForTrade] = useState(0);
  const [karmaScore, setKarmaScore] = useState(100);
  const [tradeEnergy, setTradeEnergy] = useState(100);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [moralIndicator, setMoralIndicator] = useState<'ethical' | 'neutral' | 'blocked'>('ethical');
  const [divineApproval, setDivineApproval] = useState(false);
  const [smaiPrintAuthorized, setSmaiPrintAuthorized] = useState(true);
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
        description: `Need ꠄ${amount.toFixed(2)} but only have ꠄ${smaiBalance.toFixed(2)}`,
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
          description: `Added ꠄ${amount.toFixed(2)} from successful trade`,
        });
      }
    } catch (error) {
      console.error('Failed to add trading profit:', error);
    }
  };

  // Konsmic Intelligence Trading Engine Functions
  
  // Lock funds for trading only
  const lockTradeFunds = async (amount: number): Promise<boolean> => {
    if (amount <= 0 || amount > smaiBalance) {
      toast({
        title: "Lock Failed",
        description: `Cannot lock ꠄ${amount}. Insufficient balance or invalid amount.`,
        variant: "destructive",
      });
      return false;
    }

    setSmaiBalance(prev => prev - amount);
    setLockedForTrade(prev => prev + amount);
    
    toast({
      title: "Trade Funds Locked",
      description: `ꠄ${amount} locked for trading energy`,
    });
    
    return true;
  };

  // Unlock trading funds back to balance
  const unlockTradeFunds = async (amount: number): Promise<boolean> => {
    if (amount <= 0 || amount > lockedForTrade) {
      toast({
        title: "Unlock Failed",
        description: `Cannot unlock ꠄ${amount}. Insufficient locked funds.`,
        variant: "destructive",
      });
      return false;
    }

    setLockedForTrade(prev => prev - amount);
    setSmaiBalance(prev => prev + amount);
    
    toast({
      title: "Trade Funds Unlocked",
      description: `ꠄ${amount} returned to available balance`,
    });
    
    return true;
  };

  // Update karma based on trading results
  const updateKarma = (result: 'profit' | 'loss', amount: number) => {
    if (result === 'profit') {
      setKarmaScore(prev => Math.min(200, prev + Math.floor(amount / 10)));
      setTradeEnergy(prev => Math.min(100, prev + 5));
      setMoralIndicator('ethical');
    } else {
      setKarmaScore(prev => Math.max(0, prev - Math.floor(amount / 5)));
      setTradeEnergy(prev => Math.max(0, prev - 10));
      if (karmaScore < 30) {
        setMoralIndicator('blocked');
      } else if (karmaScore < 70) {
        setMoralIndicator('neutral');
      }
    }
  };

  // Charge trade energy (add energy)
  const chargeTradeEnergy = (amount: number): boolean => {
    if (amount <= 0) return false;
    setTradeEnergy(prev => Math.min(100, prev + amount));
    return true;
  };

  // Consume trade energy for trading
  const consumeTradeEnergy = (amount: number): boolean => {
    if (amount <= 0 || amount > tradeEnergy) return false;
    setTradeEnergy(prev => prev - amount);
    return true;
  };

  // Check if trading is allowed (time lock + moral + energy)
  const isTradeAllowed = (): boolean => {
    // Check time lock
    if (lockedUntil && new Date() < new Date(lockedUntil)) {
      return false;
    }
    
    // Check moral alignment
    if (moralIndicator === 'blocked') {
      return false;
    }
    
    // Check minimum trade energy
    if (tradeEnergy < 10) {
      return false;
    }
    
    // Check SmaiPrint authorization
    if (!smaiPrintAuthorized) {
      return false;
    }
    
    return true;
  };

  // Request divine approval for major trades
  const requestDivineApproval = async (tradeAmount: number): Promise<boolean> => {
    // Major trades require divine approval (>100 SMAI)
    if (tradeAmount < 100) {
      setDivineApproval(true);
      return true;
    }

    // Simulate divine consultation based on karma and energy
    const approvalChance = (karmaScore / 100) * (tradeEnergy / 100);
    const isApproved = Math.random() < approvalChance;
    
    setDivineApproval(isApproved);
    
    if (isApproved) {
      toast({
        title: "Divine Approval Granted",
        description: "KonsAi has blessed this trade",
      });
    } else {
      toast({
        title: "Divine Approval Denied", 
        description: "KonsAi advises against this trade",
        variant: "destructive",
      });
    }
    
    return isApproved;
  };

  // Check moral alignment of trade
  const checkMoralAlignment = (tradeType: string): 'ethical' | 'neutral' | 'blocked' => {
    // Block obviously unethical patterns
    const unethicalPatterns = ['revenge', 'panic', 'greed', 'manipulation'];
    if (unethicalPatterns.some(pattern => tradeType.toLowerCase().includes(pattern))) {
      return 'blocked';
    }
    
    // Check karma level
    if (karmaScore >= 80) return 'ethical';
    if (karmaScore >= 40) return 'neutral';
    return 'blocked';
  };

  // Set time lock
  const setTimeLock = (unlockDate: string) => {
    setLockedUntil(unlockDate);
    toast({
      title: "Funds Time Locked",
      description: `Trading locked until ${new Date(unlockDate).toLocaleString()}`,
    });
  };

  // Clear time lock
  const clearTimeLock = () => {
    setLockedUntil(null);
    toast({
      title: "Time Lock Cleared",
      description: "Trading restrictions removed",
    });
  };

  // Load wallet data on mount
  useEffect(() => {
    fetchWalletData();
  }, []);

  const value: SmaiWalletContextType = {
    smaiBalance,
    localBalance,
    lockedForTrade,
    karmaScore,
    tradeEnergy,
    lockedUntil,
    moralIndicator,
    divineApproval,
    smaiPrintAuthorized,
    transactions,
    isLoading,
    updateBalance,
    addTransaction,
    fetchWalletData,
    canAffordTrade,
    deductTradingBalance,
    addTradingProfit,
    // Konsmic Intelligence functions
    lockTradeFunds,
    unlockTradeFunds,
    updateKarma,
    chargeTradeEnergy,
    consumeTradeEnergy,
    isTradeAllowed,
    requestDivineApproval,
    checkMoralAlignment,
    setTimeLock,
    clearTimeLock,
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