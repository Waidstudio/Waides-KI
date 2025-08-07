import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Square, TrendingUp, AlertCircle, Star, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Maibot - Free Entry Level Trading Bot Component
 * Designed for beginners with simplified interface and manual approval system
 */
export default function Maibot() {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Maibot status
  const { data: status, isLoading } = useQuery({
    queryKey: ["/api/waidbot-engine/maibot/status"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch recent trades
  const { data: tradesData } = useQuery({
    queryKey: ["/api/waidbot-engine/maibot/trades"],
    refetchInterval: 30000,
  });

  // Start/Stop Maibot mutations
  const startMutation = useMutation({
    mutationFn: () => apiRequest("/api/waidbot-engine/maibot/start", "POST"),
    onSuccess: () => {
      toast({
        title: "Maibot Started",
        description: "Your free trading assistant is now active and monitoring the market.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
    },
    onError: (error) => {
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start Maibot",
        variant: "destructive",
      });
    },
    onSettled: () => setIsStarting(false),
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("/api/waidbot-engine/maibot/stop", "POST"),
    onSuccess: () => {
      toast({
        title: "Maibot Stopped",
        description: "Your trading assistant has been deactivated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
    },
    onError: (error) => {
      toast({
        title: "Stop Failed",
        description: error.message || "Failed to stop Maibot",
        variant: "destructive",
      });
    },
    onSettled: () => setIsStopping(false),
  });

  const handleStart = () => {
    setIsStarting(true);
    startMutation.mutate();
  };

  const handleStop = () => {
    setIsStopping(true);
    stopMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const isActive = status?.isActive || false;
  const performance = status?.performance || {};
  const confidence = status?.confidence || 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  Maibot - Free Trading Assistant
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Perfect for beginners • Manual approval required • 35% platform fee
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-500" : "bg-gray-400"}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Control Buttons */}
          <div className="flex gap-3 mb-6">
            {!isActive ? (
              <Button
                onClick={handleStart}
                disabled={isStarting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-4 w-4" />
                {isStarting ? "Starting..." : "Start Maibot"}
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                disabled={isStopping}
                variant="destructive"
              >
                <Square className="mr-2 h-4 w-4" />
                {isStopping ? "Stopping..." : "Stop Maibot"}
              </Button>
            )}
          </div>

          {/* Free Tier Information */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Free Tier Features</AlertTitle>
            <AlertDescription className="text-blue-700">
              • Simplified market analysis • Manual trade approval required • Conservative risk management 
              • 35% platform fee on profits • Limited to basic strategies
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Trades</span>
                    <span className="font-semibold">{performance.totalTrades || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="font-semibold">{(performance.winRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Profit</span>
                    <span className={`font-semibold ${(performance.dailyProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(performance.dailyProfit || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Confidence */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={confidence} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Beginner Level</span>
                    <span className="font-semibold">{confidence}%</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Conservative Analysis
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Limitations */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-yellow-600" />
                  Free Tier Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Position</span>
                    <span className="font-semibold">0.01 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-semibold text-yellow-700">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Automation</span>
                    <span className="font-semibold text-red-600">Manual Only</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trading Signals</CardTitle>
              <CardDescription>
                AI-generated opportunities requiring your manual approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isActive ? (
                <div className="space-y-3">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Signal Available</AlertTitle>
                    <AlertDescription>
                      Market showing potential buy opportunity. RSI indicates oversold conditions.
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          Review Signal
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <div className="text-sm text-gray-500 italic">
                    All signals require manual review and approval before execution
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Start Maibot to begin receiving trading signals
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trade History</CardTitle>
              <CardDescription>
                Your approved and executed trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No trades executed yet. Start Maibot and approve signals to begin trading.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">Upgrade Your Trading Power</CardTitle>
              <CardDescription className="text-purple-700">
                Unlock advanced features with our premium bot tiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* WaidBot Alpha */}
                <div className="p-4 border border-blue-200 rounded-lg bg-white">
                  <h4 className="font-semibold text-blue-900">WaidBot α - Basic Plan ($9.99/month)</h4>
                  <p className="text-sm text-blue-700 mb-2">ETH uptrend trading with 20% platform fee</p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade to Alpha
                  </Button>
                </div>

                {/* WaidBot Pro Beta */}
                <div className="p-4 border border-green-200 rounded-lg bg-white">
                  <h4 className="font-semibold text-green-900">WaidBot Pro β - Pro Plan ($29.99/month)</h4>
                  <p className="text-sm text-green-700 mb-2">Bidirectional trading with advanced AI - 10% platform fee</p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Upgrade to Pro
                  </Button>
                </div>

                {/* Autonomous Trader */}
                <div className="p-4 border border-purple-200 rounded-lg bg-white">
                  <h4 className="font-semibold text-purple-900">Autonomous Trader γ - Elite Plan ($59.99/month)</h4>
                  <p className="text-sm text-purple-700 mb-2">Fully autonomous 24/7 trading - Fixed fee structure</p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Upgrade to Elite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}