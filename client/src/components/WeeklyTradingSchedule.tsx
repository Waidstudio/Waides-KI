import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface TradingDayInfo {
  day: string;
  rating: 'OPTIMAL' | 'GOOD' | 'CAUTION' | 'AVOID';
  behavior: string;
  recommendation: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  tradingActions: string[];
  volumeExpectation: 'LOW' | 'NORMAL' | 'HIGH';
  volatilityExpectation: 'STABLE' | 'MODERATE' | 'CHAOTIC';
}

interface TradingTimeInfo {
  timeWindow: string;
  isOptimal: boolean;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface WeeklyTradingPlan {
  currentDay: TradingDayInfo;
  currentTime: TradingTimeInfo;
  weeklySchedule: TradingDayInfo[];
  overallRecommendation: string;
  activeStrategy: string;
}

export default function WeeklyTradingSchedule() {
  const { data: weeklyPlan, isLoading } = useQuery<WeeklyTradingPlan>({
    queryKey: ['/api/weekly-schedule'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: tradingStatus } = useQuery<{
    shouldAllowTrading: boolean;
    positionSizeMultiplier: number;
    recommendation: string;
    activeStrategy: string;
  }>({
    queryKey: ['/api/weekly-schedule/should-trade'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-3 bg-slate-700 rounded w-3/4"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!weeklyPlan) return null;

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'OPTIMAL':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'GOOD':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'CAUTION':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'AVOID':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'OPTIMAL':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'GOOD':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CAUTION':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'AVOID':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'EXTREME':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span>Weekly Trading Schedule</span>
          </CardTitle>
          <CardDescription>
            Professional trading plan based on market behavior patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Day & Time Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Current Day</span>
                <Badge className={getRatingColor(weeklyPlan.currentDay.rating)}>
                  {getRatingIcon(weeklyPlan.currentDay.rating)}
                  <span className="ml-1">{weeklyPlan.currentDay.day}</span>
                </Badge>
              </div>
              <div className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                {weeklyPlan.currentDay.recommendation}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Time Window</span>
                <Badge className={weeklyPlan.currentTime.isOptimal 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }>
                  <Clock className="w-3 h-3 mr-1" />
                  {weeklyPlan.currentTime.isOptimal ? 'OPTIMAL' : 'SUBOPTIMAL'}
                </Badge>
              </div>
              <div className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                {weeklyPlan.currentTime.timeWindow}
              </div>
            </div>
          </div>

          {/* Overall Recommendation */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-300">Overall Recommendation</span>
              <span className="text-xs text-slate-400">
                Position Size: {tradingStatus ? (tradingStatus.positionSizeMultiplier * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="text-blue-200 font-medium">{weeklyPlan.overallRecommendation}</div>
            <div className="text-xs text-blue-300 mt-1">{weeklyPlan.activeStrategy}</div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Overview */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Trading Days</CardTitle>
          <CardDescription>
            Optimal trading windows based on institutional behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyPlan.weeklySchedule.map((dayInfo) => (
              <div
                key={dayInfo.day}
                className={`border rounded-lg p-4 transition-all ${
                  dayInfo.day === weeklyPlan.currentDay.day
                    ? 'border-blue-500/50 bg-blue-900/20'
                    : 'border-slate-700 bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getRatingIcon(dayInfo.rating)}
                    <span className="font-medium text-slate-200">{dayInfo.day}</span>
                    <Badge className={getRatingColor(dayInfo.rating)} variant="outline">
                      {dayInfo.rating}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400">Risk:</span>
                    <span className={getRiskColor(dayInfo.riskLevel)}>{dayInfo.riskLevel}</span>
                  </div>
                </div>
                
                <div className="text-sm text-slate-300 mb-2">
                  {dayInfo.behavior}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {dayInfo.tradingActions.map((action, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                    >
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Guidelines */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Professional Trading Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-green-400">✅ Best Trading Days</div>
              <div className="text-slate-300">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">Tuesday - Thursday:</span>
                  <span>Prime trading window</span>
                </div>
                <div className="text-xs text-slate-400">
                  Clean trends, stable volume, lower fakeouts
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-red-400">⚠️ Caution Days</div>
              <div className="text-slate-300">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">Monday & Friday:</span>
                  <span>High risk periods</span>
                </div>
                <div className="text-xs text-slate-400">
                  Choppy action, weekend effects, position exits
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg">
            <div className="text-amber-300 font-medium text-sm mb-1">
              🕐 Optimal Time: 6:30 AM - 9:30 AM PDT
            </div>
            <div className="text-amber-200 text-xs">
              Peak institutional volume and direction clarity
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}