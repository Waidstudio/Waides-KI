import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  Crown, 
  Zap, 
  Rocket, 
  Infinity, 
  Sparkles, 
  Settings,
  TrendingUp,
  Shield,
  Lock,
  Unlock,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Phase 3: Unified Bot Management Dashboard
 * Central interface for managing all 6 trading entities with subscription-based access control
 */

// Bot tier configuration with icons and colors
const BOT_TIER_CONFIG = {
  free: {
    icon: Star,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
    name: "Maibot",
    description: "Free Trading Assistant"
  },
  basic: {
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-900",
    name: "WaidBot α",
    description: "Basic ETH Uptrend Trading"
  },
  pro: {
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-900",
    name: "WaidBot Pro β",
    description: "Professional Bidirectional Trading"
  },
  elite: {
    icon: Zap,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-900",
    name: "Autonomous Trader γ",
    description: "24/7 Market Scanner Elite"
  },
  master: {
    icon: Rocket,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-900",
    name: "Full Engine Ω",
    description: "Master Trading Engine"
  },
  divine_delta: {
    icon: Sparkles,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-900",
    name: "SmaiChinnikstah δ",
    description: "Divine Spiritual Trading"
  },
  cosmic_epsilon: {
    icon: Infinity,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-900",
    name: "Nwaora Chigozie ε",
    description: "Cosmic Intelligence Omega"
  }
};

export default function UnifiedBotDashboard() {
  const [selectedTier, setSelectedTier] = useState<string>('free');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscriptions/current"],
    refetchInterval: 30000,
  });

  // Fetch available bot tiers
  const { data: tiersData } = useQuery({
    queryKey: ["/api/subscriptions/tiers"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch bot access for selected tier
  const { data: accessData } = useQuery({
    queryKey: ["/api/subscriptions/access", selectedTier],
    enabled: !!selectedTier,
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: (data: { toTier: string; paymentMethod: string }) => 
      apiRequest("/api/subscriptions/upgrade", "POST", data),
    onSuccess: (data) => {
      toast({
        title: "Upgrade Successful",
        description: data.message || "Subscription upgraded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });

  // Start trial mutation
  const trialMutation = useMutation({
    mutationFn: (data: { botTier: string; trialDays?: number }) => 
      apiRequest("/api/subscriptions/trial", "POST", data),
    onSuccess: (data) => {
      toast({
        title: "Trial Started",
        description: data.message || "Free trial started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
    },
    onError: (error: any) => {
      toast({
        title: "Trial Failed",
        description: error.message || "Failed to start trial",
        variant: "destructive",
      });
    },
  });

  const currentTier = subscriptionData?.subscription?.tier || 'free';
  const isFreeTier = subscriptionData?.subscription?.isFreeTier !== false;

  if (subscriptionLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Unified Bot Dashboard</h2>
          <p className="text-blue-200">
            Manage all trading entities from one central interface
          </p>
        </div>
        <Badge 
          variant="outline" 
          className={`px-4 py-2 ${BOT_TIER_CONFIG[currentTier as keyof typeof BOT_TIER_CONFIG]?.bgColor}`}
        >
          Current: {BOT_TIER_CONFIG[currentTier as keyof typeof BOT_TIER_CONFIG]?.name}
        </Badge>
      </div>

      {/* Current Subscription Overview */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const config = BOT_TIER_CONFIG[currentTier as keyof typeof BOT_TIER_CONFIG];
              const Icon = config?.icon || Star;
              return <Icon className="h-6 w-6" />;
            })()}
            {subscriptionData?.subscription?.displayName || 'Free Trading Assistant'}
          </CardTitle>
          <CardDescription>
            {subscriptionData?.subscription?.features?.length || 0} features included
            {!isFreeTier && ` • ${subscriptionData?.subscription?.platformFeeRate * 100}% platform fee`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${subscriptionData?.subscription?.monthlyPrice || 0}/mo
              </div>
              <div className="text-sm text-gray-600">Monthly Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {subscriptionData?.subscription?.maxPositionSize || 0.01} ETH
              </div>
              <div className="text-sm text-gray-600">Max Position</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {subscriptionData?.subscription?.automationLevel || 'Manual'}
              </div>
              <div className="text-sm text-gray-600">Automation</div>
            </div>
          </div>

          {/* Features List */}
          {subscriptionData?.subscription?.features && (
            <div className="space-y-2">
              <h4 className="font-semibold">Included Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscriptionData.subscription.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bot Tiers Grid */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(BOT_TIER_CONFIG).map(([tier, config]) => {
              const Icon = config.icon;
              const tierData = tiersData?.tiers?.find((t: any) => t.tier === tier);
              const hasAccess = currentTier === tier || (tierData?.monthlyPrice === 0 && isFreeTier);

              return (
                <Card 
                  key={tier} 
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedTier === tier ? 'ring-2 ring-blue-500' : ''
                  } ${hasAccess ? 'border-green-200' : 'border-gray-200'}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {hasAccess ? (
                        <Unlock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="font-semibold">
                          ${tierData?.monthlyPrice || 0}/mo
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Platform Fee</span>
                        <span className="font-semibold text-orange-600">
                          {((tierData?.platformFeeRate || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={hasAccess ? 100 : 0} 
                        className="h-2"
                      />
                      <div className="text-xs text-center">
                        {hasAccess ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Upgrade</CardTitle>
              <CardDescription>
                Upgrade your trading capabilities with advanced bot tiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiersData?.tiers
                ?.filter((tier: any) => tier.tier !== currentTier && tier.monthlyPrice > 0)
                ?.map((tier: any) => {
                  const config = BOT_TIER_CONFIG[tier.tier as keyof typeof BOT_TIER_CONFIG];
                  const Icon = config?.icon || Star;

                  return (
                    <div 
                      key={tier.tier}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${config?.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{tier.displayName}</h4>
                          <p className="text-sm text-gray-600">
                            ${tier.monthlyPrice}/month • {tier.platformFeeRate * 100}% fee
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => trialMutation.mutate({ 
                            botTier: tier.tier,
                            trialDays: 7 
                          })}
                          disabled={trialMutation.isPending}
                        >
                          7-Day Trial
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => upgradeMutation.mutate({ 
                            toTier: tier.tier,
                            paymentMethod: 'stripe'
                          })}
                          disabled={upgradeMutation.isPending}
                        >
                          Upgrade <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Bot Management
              </CardTitle>
              <CardDescription>
                Control and configure your active trading bots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Access Control Active</AlertTitle>
                <AlertDescription>
                  Bot access is automatically managed based on your subscription tier. 
                  Upgrade to unlock additional trading entities and features.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track your trading performance across all bot tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}