import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  DollarSign,
  Pause,
  Play,
  Signal,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TradeActivityPanel } from "@/components/TradeActivityPanel";

type BotPerformance = {
  totalTrades?: number;
  trades?: number;
  winRate?: number;
  profit?: number;
  dailyProfit?: number;
  currentWinningStreak?: number;
  longestWinningStreak?: number;
};

type BotStatus = {
  isActive?: boolean;
  activeConnector?: string;
  recentTrades?: any[];
  performance?: BotPerformance;
};

type BotBalance = {
  available?: number;
  invested?: number;
  totalProfit?: number;
  dailyProfit?: number;
  currency?: string;
  mode?: "demo" | "real";
};

const defaultStatus: BotStatus = {
  isActive: false,
  activeConnector: "Binary Options Platform",
  recentTrades: [],
  performance: { totalTrades: 0, winRate: 0, profit: 0 },
};

const defaultBalance: Required<BotBalance> = {
  available: 0,
  invested: 0,
  totalProfit: 0,
  dailyProfit: 0,
  currency: "SmaiSika",
  mode: "demo",
};

export function WaidBot() {
  const [activeTab, setActiveTab] = useState("overview");
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const { toast } = useToast();

  const { data: statusData } = useQuery<BotStatus>({
    queryKey: ["/api/waidbot-engine/waidbot/status"],
    refetchInterval: 5000,
  });

  const { data: balanceData } = useQuery<{ balance?: BotBalance }>({
    queryKey: ["/api/waidbot-engine/waidbot/balance"],
    refetchInterval: 3000,
  });

  const status = { ...defaultStatus, ...statusData };
  const performance = { ...defaultStatus.performance, ...status.performance };
  const balance = { ...defaultBalance, ...(balanceData?.balance || {}) };

  const startMutation = useMutation({
    mutationFn: () => apiRequest("/api/waidbot-engine/waidbot/start", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/waidbot/status"] });
      toast({ title: "WaidBot started", description: "Alpha bot is now active." });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("/api/waidbot-engine/waidbot/stop", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/waidbot/status"] });
      toast({ title: "WaidBot stopped", description: "Alpha bot has been paused." });
    },
  });

  const fundMutation = useMutation({
    mutationFn: (amount: number) => apiRequest("/api/waidbot-engine/waidbot/fund", "POST", { amount }),
    onSuccess: () => {
      setFundAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/waidbot/balance"] });
      toast({ title: "Funding successful", description: "Funds were added to WaidBot." });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => apiRequest("/api/waidbot-engine/waidbot/withdraw", "POST", { amount }),
    onSuccess: () => {
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/waidbot/balance"] });
      toast({ title: "Withdrawal successful", description: "Funds were returned from WaidBot." });
    },
  });

  const submitAmount = (value: string, action: (amount: number) => void) => {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) {
      action(amount);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-400">WaidBot Alpha</h1>
          <p className="text-sm text-slate-400">ETH uptrend specialist with bot wallet controls.</p>
        </div>
        <div className="flex gap-2">
          <Badge className={status.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-300"}>
            {status.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">{balance.mode === "real" ? "Live" : "Demo"}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TradeActivityPanel
            botName="WaidBot Alpha"
            trades={status.recentTrades || []}
            performance={{
              totalTrades: performance.totalTrades || performance.trades || 0,
              winRate: performance.winRate || 0,
              profit: performance.profit || performance.dailyProfit || 0,
              currentWinningStreak: performance.currentWinningStreak || 0,
              longestWinningStreak: performance.longestWinningStreak || 0,
            }}
            activeConnector={status.activeConnector || "Binary Options Platform"}
            profitSharing={{ userShare: 80, platformShare: 20 }}
            marketType="binary"
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Trading Controls
              </CardTitle>
              <CardDescription>Start or pause the Alpha bot.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => (status.isActive ? stopMutation.mutate() : startMutation.mutate())}
                disabled={startMutation.isPending || stopMutation.isPending}
                variant={status.isActive ? "destructive" : "default"}
              >
                {status.isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {status.isActive ? "Stop WaidBot" : "Start WaidBot"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Available", balance.available],
              ["Invested", balance.invested],
              ["Total Profit", balance.totalProfit],
              ["Daily Profit", balance.dailyProfit],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-2xl font-bold">{Number(value).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{balance.currency}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Fund Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="fund-amount">Amount</Label>
                <Input id="fund-amount" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} />
                <Button onClick={() => submitAmount(fundAmount, (amount) => fundMutation.mutate(amount))}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Fund
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5" />
                  Withdraw
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input
                  id="withdraw-amount"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => submitAmount(withdrawAmount, (amount) => withdrawMutation.mutate(amount))}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals">
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              <Signal className="mx-auto mb-3 h-10 w-10" />
              Real-time signals will appear here.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              <BarChart3 className="mx-auto mb-3 h-10 w-10" />
              Trade history will appear here.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WaidBot;
