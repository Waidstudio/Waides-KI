import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Activity,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  Settings,
  BarChart3,
  Zap,
  Heart,
  Database
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function NwaoraChigoziePage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch Nwaora Chigozie status
  const { data: guardianStatus } = useQuery({
    queryKey: ['/api/divine-bots/nwaora-chigozie/status'],
    refetchInterval: 3000
  });

  // Fetch balance
  const { data: balanceData } = useQuery({
    queryKey: ['/api/waidbot-engine/nwaora-chigozie/balance'],
    refetchInterval: 4000
  });

  // Fetch trade history
  const { data: tradesData } = useQuery({
    queryKey: ['/api/divine-bots/nwaora-chigozie/trades'],
    refetchInterval: 5000
  });

  const status = guardianStatus || {};
  const balance = balanceData?.balance || 0;
  const performance = status.performance || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                Nwaora Chigozie ε
                <div className="h-6 w-6 text-purple-400" title="Always-On Guardian">🛡️</div>
              </h1>
              <p className="text-purple-200">Always-On Guardian System - 24/7 Protection & Backup Trading</p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                ALWAYS ACTIVE
              </Badge>
            </div>
          </div>

          {/* Guardian Notice */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-400/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-purple-400" />
                <p className="text-purple-100">
                  <strong>Guardian Mode:</strong> Nwaora Chigozie ε operates continuously as an always-on guardian system. 
                  This bot cannot be manually started or stopped as it provides 24/7 protection and backup trading capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Guardian Status Panel */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Guardian Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">System Monitoring</span>
                  <span className="text-green-400">{status.protection?.systemMonitoring || 'ACTIVE'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Risk Assessment</span>
                  <span className="text-green-400">{status.protection?.riskAssessment || 'CONTINUOUS'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Emergency Response</span>
                  <span className="text-green-400">{status.protection?.emergencyIntervention || 'READY'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Backup Trading</span>
                  <span className="text-yellow-400">{status.protection?.backupTrading || 'STANDBY'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Intervention Capacity</div>
                <Progress value={status.interventionCapacity || 100} className="h-2" />
                <div className="text-xs text-slate-500 mt-1">{status.interventionCapacity || 100}%</div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400 mb-2">Uptime</div>
                <div className="text-2xl font-bold text-white">{status.uptimeHours || 0} hours</div>
                <div className="text-xs text-slate-500">{performance.uptime || '99.97%'} reliability</div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Interventions</div>
                  <div className="text-xl font-bold text-white">{performance.interventionsExecuted || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">System Checks</div>
                  <div className="text-xl font-bold text-white">{performance.systemChecks || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Risks Mitigated</div>
                  <div className="text-xl font-bold text-green-400">{performance.risksMitigated || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Win Rate</div>
                  <div className="text-xl font-bold text-green-400">{performance.winRate || 0}%</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Total Profit</span>
                  <span className="text-lg font-bold text-green-400">${performance.totalProfit?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Backup Activations</span>
                  <span className="text-sm text-yellow-400">{performance.tradingBackupActivations || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-400" />
                Guardian Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Available Balance</div>
                  <div className="text-3xl font-bold text-white">{balance.toFixed(2)} SmaiSika</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Total Invested</div>
                  <div className="text-xl font-bold text-blue-400">{balanceData?.invested?.toFixed(2) || '0.00'} SmaiSika</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Total Profit</div>
                  <div className="text-xl font-bold text-green-400">+{balanceData?.totalProfit?.toFixed(2) || '0.00'} SmaiSika</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <Badge variant="outline" className="text-purple-400 border-purple-400/40">
                  Trading Mode: {balanceData?.tradingMode || 'Demo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Guardian Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tradesData?.trades?.slice(0, 5).map((trade: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${trade.result === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {trade.result === 'win' ? <TrendingUp className="h-4 w-4 text-green-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{trade.symbol || 'ETH/USD'}</div>
                      <div className="text-xs text-slate-400">{trade.timestamp || 'Just now'}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.profit > 0 ? '+' : ''}{trade.profit?.toFixed(2) || '0.00'} SmaiSika
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-slate-400">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Guardian monitoring all systems...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
