import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bot,
  Wallet,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface TreasurySummary {
  success: boolean;
  treasury: {
    currentBalance: {
      smaiBalance: number;
      usdBalance: number;
      localBalance: number;
      totalValue: number;
    };
    revenue: {
      totalRevenue: number;
      tradingRevenue: number;
      miningRevenue: number;
    };
    stats: {
      totalTransactions: number;
      lastUpdated: string;
    };
  };
}

interface BotRevenue {
  botName: string;
  totalRevenue: number;
  transactions: number;
  avgRevenuePerTrade: number;
}

interface TreasuryRevenue {
  success: boolean;
  period: string;
  data: {
    revenueByBot: BotRevenue[];
    totals: {
      totalRevenue: number;
      totalTransactions: number;
      avgRevenuePerTransaction: number;
    };
    dateRange: {
      start: string;
      end: string;
    };
  };
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TreasuryDashboard() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  // Fetch treasury summary
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<TreasurySummary>({
    queryKey: ['/api/treasury/summary'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch treasury revenue
  const { data: revenue, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery<TreasuryRevenue>({
    queryKey: ['/api/treasury/revenue', { period }],
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchRevenue();
    toast({
      title: "Refreshing Data",
      description: "Treasury analytics are being updated",
    });
  };

  const handlePeriodChange = (newPeriod: '24h' | '7d' | '30d' | '90d') => {
    setPeriod(newPeriod);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Treasury Analytics
            </h1>
            <p className="text-slate-300">
              Monitor revenue, balances, and bot performance with 50/50 profit-sharing
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            data-testid="button-refresh-treasury"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-total-balance">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryLoading ? '...' : `${formatCurrency(summary?.treasury.currentBalance.totalValue || 0)} SS`}
              </div>
              <p className="text-xs text-slate-400 mt-1">Combined treasury value</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-smai-balance">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">SmaiSika Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {summaryLoading ? '...' : `${formatCurrency(summary?.treasury.currentBalance.smaiBalance || 0)} SS`}
              </div>
              <p className="text-xs text-slate-400 mt-1">Primary treasury currency</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-total-revenue">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {summaryLoading ? '...' : `${formatCurrency(summary?.treasury.revenue.totalRevenue || 0)} SS`}
              </div>
              <p className="text-xs text-slate-400 mt-1">All-time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-transactions">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {summaryLoading ? '...' : summary?.treasury.stats.totalTransactions.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total recorded</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-revenue-breakdown">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Revenue Breakdown</CardTitle>
                <CardDescription className="text-slate-300">
                  50/50 profit sharing from trading bots
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {(['24h', '7d', '30d', '90d'] as const).map((p) => (
                  <Button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    variant={period === p ? "default" : "outline"}
                    size="sm"
                    className={period === p 
                      ? "bg-blue-600 text-white" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"}
                    data-testid={`button-period-${p}`}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger value="chart" className="text-white" data-testid="tab-chart">Chart View</TabsTrigger>
                <TabsTrigger value="table" className="text-white" data-testid="tab-table">Table View</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="space-y-4">
                {revenueLoading ? (
                  <div className="flex items-center justify-center h-64 text-white">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-4">Revenue by Bot</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenue?.data.revenueByBot || []}>
                          <XAxis 
                            dataKey="botName" 
                            stroke="#94a3b8"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number) => `${formatCurrency(value)} SS`}
                          />
                          <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-4">Revenue Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                          <Pie
                            data={revenue?.data.revenueByBot || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({botName, percent}) => `${botName}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="totalRevenue"
                          >
                            {revenue?.data.revenueByBot.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number) => `${formatCurrency(value)} SS`}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-300">Total Revenue ({period})</div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(revenue?.data.totals.totalRevenue || 0)} SS
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-300">Total Transactions</div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {revenue?.data.totals.totalTransactions.toLocaleString() || '0'}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                      <div className="text-sm text-slate-300">Avg per Transaction</div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(revenue?.data.totals.avgRevenuePerTransaction || 0)} SS
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="table">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-bot-revenue">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Bot Name</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Total Revenue</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Transactions</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">Avg/Trade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue?.data.revenueByBot.map((bot, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-white/5 hover:bg-white/5"
                          data-testid={`row-bot-${index}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-medium">{bot.botName}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-emerald-400 font-semibold">
                            {formatCurrency(bot.totalRevenue)} SS
                          </td>
                          <td className="text-right py-3 px-4 text-white">
                            {bot.transactions.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-blue-400">
                            {formatCurrency(bot.avgRevenuePerTrade)} SS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Date Range Info */}
        {revenue && (
          <Card className="bg-white/5 border-white/10" data-testid="card-date-range">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Data Period:</span>
                </div>
                <div className="font-medium text-white">
                  {formatDate(revenue.data.dateRange.start)} - {formatDate(revenue.data.dateRange.end)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
