import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, TrendingUp, History, ArrowRightLeft, Plus, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'conversion' | 'trade' | 'withdrawal';
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export default function SmaiSikaWallet() {
  const [smaiBalance, setSmaiBalance] = useState(0);
  const [localBalance, setLocalBalance] = useState(0);
  const [fundAmount, setFundAmount] = useState('');
  const [convertAmount, setConvertAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const conversionRate = 500; // 1 ₭ = ₦500
  const convertedAmount = convertAmount ? (parseFloat(convertAmount) / conversionRate).toFixed(2) : '0.00';

  // Fetch wallet data from backend
  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();
      if (data.success) {
        setSmaiBalance(data.smaiBalance);
        setLocalBalance(data.localBalance);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transactions');
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const handleFundWallet = async () => {
    const amount = parseFloat(fundAmount);
    if (amount > 0) {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/wallet/fund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            paymentMethod
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setLocalBalance(data.newBalance);
          setTransactions(prev => [data.transaction, ...prev]);
          setFundAmount('');
          toast({
            title: "Success",
            description: data.message,
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fund wallet",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fund wallet",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConvert = async () => {
    const amount = parseFloat(convertAmount);
    if (amount > 0 && amount <= localBalance) {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/wallet/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            fromCurrency: 'local',
            toCurrency: 'smai'
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setSmaiBalance(data.newSmaiBalance);
          setLocalBalance(data.newLocalBalance);
          setTransactions(prev => [data.transaction, ...prev]);
          setConvertAmount('');
          toast({
            title: "Success",
            description: data.message,
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to convert currency",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to convert currency",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Plus className="h-4 w-4 text-green-500" />;
      case 'conversion': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      case 'trade': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          💰 SmaiSika Wallet
        </h1>
        <p className="text-muted-foreground">
          Manage your SmaiSika currency for Waides KI trading operations
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SmaiSika Balance</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ₭ {smaiBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Wallet Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₦ {localBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Nigerian Naira</p>
          </CardContent>
        </Card>
      </div>

      {/* Fund Wallet Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-500" />
            Fund Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fund-amount">Amount (₦)</Label>
              <Input
                id="fund-amount"
                type="number"
                placeholder="Enter amount to fund"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paystack">Paystack</SelectItem>
                  <SelectItem value="flutterwave">Flutterwave</SelectItem>
                  <SelectItem value="manual">Manual Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleFundWallet} 
            disabled={!fundAmount || parseFloat(fundAmount) <= 0 || isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Fund Wallet'}
          </Button>
        </CardContent>
      </Card>

      {/* Convert Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            Convert Local to SmaiSika
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="convert-amount">Amount to Convert (₦)</Label>
              <Input
                id="convert-amount"
                type="number"
                placeholder="Enter amount to convert"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>You will receive</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  ₭ {convertedAmount}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Exchange Rate: 1 ₭ = ₦{conversionRate.toLocaleString()}
          </div>
          <Button 
            onClick={handleConvert} 
            disabled={!convertAmount || parseFloat(convertAmount) <= 0 || parseFloat(convertAmount) > localBalance || isLoading}
            className="w-full"
          >
            {isLoading ? 'Converting...' : 'Convert to SmaiSika'}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-500" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">{transaction.amount}</div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-semibold">Ready for Trading</h3>
              <p className="text-sm text-muted-foreground">
                Your SmaiSika balance is automatically available for Waides KI trading operations including WaidBot and WaidBot Pro
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}