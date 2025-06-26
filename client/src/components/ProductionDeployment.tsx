import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Zap,
  Lock,
  Globe,
  Cpu,
  Database
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ConnectivityTest {
  connectivity: boolean;
  authentication: boolean;
  api_status: string;
  rate_limits_ok: boolean;
  server_time_sync: boolean;
  message: string;
}

interface RiskDashboard {
  account: {
    initialBalance: number;
    currentBalance: number;
    availableBalance: number;
    lockedBalance: number;
    totalPnL: number;
    dailyPnL: number;
    weeklyPnL: number;
    monthlyPnL: number;
    maxDrawdown: number;
    peakBalance: number;
  };
  riskLimits: {
    maxDailyLossPercent: number;
    maxTradeSize: number;
    maxPositionSize: number;
    maxDrawdownPercent: number;
    maxOpenPositions: number;
    maxDailyTrades: number;
    cooldownPeriodMs: number;
    emergencyStopThreshold: number;
  };
  emergencyStopActive: boolean;
  dailyTradeCount: number;
  openPositions: number;
  complianceStatus: {
    passed: boolean;
    violations: string[];
    recommendations: string[];
    riskLevel: string;
  };
  overallRiskScore: number;
}

interface MarketData {
  price: { symbol: string; price: string };
  ticker: any;
  orderBook: any;
  klines: any[];
  indicators: any;
}

const ProductionDeployment: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('ETHUSDT');
  const [tradeAmount, setTradeAmount] = useState('100');
  const [tradeSide, setTradeSide] = useState('BUY');
  const queryClient = useQueryClient();

  // Connectivity Test Query
  const { data: connectivityData, isLoading: connectivityLoading, refetch: refetchConnectivity } = useQuery({
    queryKey: ['/api/production/binance/connectivity'],
    refetchInterval: 30000
  });

  // Risk Dashboard Query
  const { data: riskDashboard, isLoading: riskLoading, refetch: refetchRisk } = useQuery({
    queryKey: ['/api/production/risk/dashboard'],
    refetchInterval: 10000
  });

  // Market Data Query
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/production/binance/market-data', selectedSymbol],
    refetchInterval: 5000
  });

  // Health Check Query
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/production/health'],
    refetchInterval: 15000
  });

  // Risk Assessment Mutation
  const riskAssessment = useMutation({
    mutationFn: (params: { trade_amount: string; symbol: string; side: string }) =>
      apiRequest('/api/production/risk/assess-trade', {
        method: 'POST',
        body: JSON.stringify(params)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production/risk/dashboard'] });
    }
  });

  // Emergency Stop Mutation
  const emergencyStop = useMutation({
    mutationFn: (reason: string) =>
      apiRequest('/api/production/risk/emergency-stop', {
        method: 'POST',
        body: JSON.stringify({ reason })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/production/risk/dashboard'] });
    }
  });

  // Demo Workflow Query
  const { data: demoData, isLoading: demoLoading, refetch: runDemo } = useQuery({
    queryKey: ['/api/production/demo-workflow'],
    enabled: false
  });

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-400' : 'text-red-400';
    }
    return status === 'operational' ? 'text-green-400' : 'text-yellow-400';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6 p-6 bg-black text-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Production Deployment & Security Audit
          </h1>
          <p className="text-gray-400 mt-2">
            STEP 54: Real-world deployment with unified Binance API and comprehensive risk management
          </p>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400">
          v54.0.0 Production Ready
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 bg-gray-900 border border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="data-[state=active]:bg-purple-600">
            <Globe className="h-4 w-4 mr-2" />
            Connectivity
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-purple-600">
            <Shield className="h-4 w-4 mr-2" />
            Risk Management
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-purple-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Data
          </TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-purple-600">
            <Zap className="h-4 w-4 mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="demo" className="data-[state=active]:bg-purple-600">
            <Cpu className="h-4 w-4 mr-2" />
            Demo
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">System Status</p>
                    <p className={`text-lg font-semibold ${getStatusColor(healthData?.status || 'unknown')}`}>
                      {healthData?.status || 'Loading...'}
                    </p>
                  </div>
                  <Activity className={`h-8 w-8 ${getStatusColor(healthData?.status === 'operational')}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">API Connectivity</p>
                    <p className={`text-lg font-semibold ${getStatusColor(connectivityData?.connectivity_test?.connectivity || false)}`}>
                      {connectivityData?.connectivity_test?.connectivity ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  <Globe className={`h-8 w-8 ${getStatusColor(connectivityData?.connectivity_test?.connectivity || false)}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Current Balance</p>
                    <p className="text-lg font-semibold text-green-400">
                      {riskDashboard?.risk_dashboard?.account?.currentBalance 
                        ? formatCurrency(riskDashboard.risk_dashboard.account.currentBalance)
                        : 'Loading...'
                      }
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Risk Level</p>
                    <p className={`text-lg font-semibold ${
                      riskDashboard?.risk_dashboard?.complianceStatus?.riskLevel === 'low' ? 'text-green-400' :
                      riskDashboard?.risk_dashboard?.complianceStatus?.riskLevel === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {riskDashboard?.risk_dashboard?.complianceStatus?.riskLevel || 'Loading...'}
                    </p>
                  </div>
                  <Shield className={`h-8 w-8 ${
                    riskDashboard?.risk_dashboard?.complianceStatus?.riskLevel === 'low' ? 'text-green-400' :
                    riskDashboard?.risk_dashboard?.complianceStatus?.riskLevel === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Components */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Components Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(healthData?.components?.binance_connectivity || false)}
                    <span className="text-sm">Binance API</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(healthData?.components?.risk_manager || false)}
                    <span className="text-sm">Risk Manager</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(healthData?.components?.database || false)}
                    <span className="text-sm">Database</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(healthData?.components?.websockets || false)}
                    <span className="text-sm">WebSockets</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          {riskDashboard?.risk_dashboard?.emergencyStopActive && (
            <Alert className="border-red-500 bg-red-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-red-400">Emergency Stop Active</AlertTitle>
              <AlertDescription className="text-red-300">
                All trading has been halted due to emergency stop activation. Check risk management tab for details.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Connectivity Tab */}
        <TabsContent value="connectivity" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Binance API Connectivity</h2>
            <Button 
              onClick={() => refetchConnectivity()}
              disabled={connectivityLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              {connectivityLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : connectivityData?.connectivity_test ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connectivityData.connectivity_test.connectivity)}
                      <span className="text-sm">Connectivity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connectivityData.connectivity_test.authentication)}
                      <span className="text-sm">Authentication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connectivityData.connectivity_test.rate_limits_ok)}
                      <span className="text-sm">Rate Limits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connectivityData.connectivity_test.server_time_sync)}
                      <span className="text-sm">Time Sync</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`${
                        connectivityData.connectivity_test.api_status === 'operational' 
                          ? 'text-green-400 border-green-400' 
                          : 'text-yellow-400 border-yellow-400'
                      }`}>
                        {connectivityData.connectivity_test.api_status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Status Message:</p>
                    <p className="text-sm">{connectivityData.connectivity_test.message}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No connectivity data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Management Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Risk Management Dashboard</h2>
            <div className="flex space-x-2">
              <Button 
                onClick={() => refetchRisk()}
                disabled={riskLoading}
                variant="outline"
                className="border-gray-600"
              >
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {!riskDashboard?.risk_dashboard?.emergencyStopActive && (
                <Button 
                  onClick={() => emergencyStop.mutate('Manual emergency stop from dashboard')}
                  disabled={emergencyStop.isPending}
                  variant="destructive"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Stop
                </Button>
              )}
            </div>
          </div>

          {riskLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : riskDashboard?.risk_dashboard ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Overview */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="font-semibold">{formatCurrency(riskDashboard.risk_dashboard.account.currentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-green-400">{formatCurrency(riskDashboard.risk_dashboard.account.availableBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Locked:</span>
                    <span className="text-yellow-400">{formatCurrency(riskDashboard.risk_dashboard.account.lockedBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily P&L:</span>
                    <span className={riskDashboard.risk_dashboard.account.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(riskDashboard.risk_dashboard.account.dailyPnL)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Drawdown:</span>
                    <span className="text-red-400">{formatPercentage(riskDashboard.risk_dashboard.account.maxDrawdown)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Limits */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Daily Loss:</span>
                    <span className="font-semibold">{formatPercentage(riskDashboard.risk_dashboard.riskLimits.maxDailyLossPercent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Trade Size:</span>
                    <span className="font-semibold">{formatCurrency(riskDashboard.risk_dashboard.riskLimits.maxTradeSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Positions:</span>
                    <span className="font-semibold">{riskDashboard.risk_dashboard.riskLimits.maxOpenPositions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Trades:</span>
                    <span className="font-semibold">
                      {riskDashboard.risk_dashboard.dailyTradeCount} / {riskDashboard.risk_dashboard.riskLimits.maxDailyTrades}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Score:</span>
                    <Badge variant="outline" className={`${
                      riskDashboard.risk_dashboard.overallRiskScore <= 30 ? 'text-green-400 border-green-400' :
                      riskDashboard.risk_dashboard.overallRiskScore <= 70 ? 'text-yellow-400 border-yellow-400' :
                      'text-red-400 border-red-400'
                    }`}>
                      {riskDashboard.risk_dashboard.overallRiskScore}/100
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card className="bg-gray-900 border-gray-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    {getStatusIcon(riskDashboard.risk_dashboard.complianceStatus.passed)}
                    <span className={`font-semibold ${
                      riskDashboard.risk_dashboard.complianceStatus.passed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {riskDashboard.risk_dashboard.complianceStatus.passed ? 'Compliant' : 'Non-Compliant'}
                    </span>
                    <Badge variant="outline" className={`ml-auto ${
                      riskDashboard.risk_dashboard.complianceStatus.riskLevel === 'low' ? 'text-green-400 border-green-400' :
                      riskDashboard.risk_dashboard.complianceStatus.riskLevel === 'medium' ? 'text-yellow-400 border-yellow-400' :
                      'text-red-400 border-red-400'
                    }`}>
                      {riskDashboard.risk_dashboard.complianceStatus.riskLevel} risk
                    </Badge>
                  </div>
                  
                  {riskDashboard.risk_dashboard.complianceStatus.violations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-red-400 font-semibold mb-2">Violations:</p>
                      <ul className="space-y-1">
                        {riskDashboard.risk_dashboard.complianceStatus.violations.map((violation, index) => (
                          <li key={index} className="text-sm text-red-300 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-2" />
                            {violation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {riskDashboard.risk_dashboard.complianceStatus.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-yellow-400 font-semibold mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {riskDashboard.risk_dashboard.complianceStatus.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-yellow-300">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-gray-400">No risk data available</p>
          )}
        </TabsContent>

        {/* Market Data Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Live Market Data</h2>
            <div className="flex items-center space-x-2">
              <Label htmlFor="symbol">Symbol:</Label>
              <Input
                id="symbol"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-24 bg-gray-800 border-gray-600"
                placeholder="ETHUSDT"
              />
            </div>
          </div>

          {marketLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-700 rounded"></div>
            </div>
          ) : marketData?.market_data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Information */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Current Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Symbol:</span>
                      <span className="font-mono text-lg">{marketData.market_data.price.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price:</span>
                      <span className="font-mono text-2xl text-green-400">
                        ${parseFloat(marketData.market_data.price.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Indicators */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  {marketData.market_data.indicators ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">RSI:</span>
                        <span className={`font-semibold ${
                          marketData.market_data.indicators.rsi > 70 ? 'text-red-400' :
                          marketData.market_data.indicators.rsi < 30 ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          {marketData.market_data.indicators.rsi?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">EMA20:</span>
                        <span className="font-mono">${marketData.market_data.indicators.ema20?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">EMA50:</span>
                        <span className="font-mono">${marketData.market_data.indicators.ema50?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volatility:</span>
                        <span className="font-semibold">{formatPercentage(marketData.market_data.indicators.volatility || 0)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">No indicators available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-gray-400">No market data available</p>
          )}
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <h2 className="text-xl font-semibold">Trade Risk Assessment</h2>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Test Trade Parameters</CardTitle>
              <CardDescription>
                Assess trading risk before execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="trade-amount">Trade Amount (USD)</Label>
                  <Input
                    id="trade-amount"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="trade-symbol">Symbol</Label>
                  <Input
                    id="trade-symbol"
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                    placeholder="ETHUSDT"
                  />
                </div>
                <div>
                  <Label htmlFor="trade-side">Side</Label>
                  <select
                    id="trade-side"
                    value={tradeSide}
                    onChange={(e) => setTradeSide(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>
              
              <Button
                onClick={() => riskAssessment.mutate({
                  trade_amount: tradeAmount,
                  symbol: selectedSymbol,
                  side: tradeSide
                })}
                disabled={riskAssessment.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Assess Risk
              </Button>

              {riskAssessment.data && (
                <div className="mt-4 p-4 border border-gray-600 rounded-lg">
                  <h4 className="font-semibold mb-3">Risk Assessment Result</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(riskAssessment.data.trade_assessment.allowed)}
                      <span className={`font-semibold ${
                        riskAssessment.data.trade_assessment.allowed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {riskAssessment.data.trade_assessment.allowed ? 'Trade Allowed' : 'Trade Blocked'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Score:</span>
                      <span className="font-semibold">{riskAssessment.data.trade_assessment.riskScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position Multiplier:</span>
                      <span className="font-semibold">{riskAssessment.data.trade_assessment.positionSizeMultiplier}x</span>
                    </div>
                    
                    {riskAssessment.data.trade_assessment.warnings.length > 0 && (
                      <div>
                        <p className="text-yellow-400 font-semibold">Warnings:</p>
                        <ul className="text-sm space-y-1">
                          {riskAssessment.data.trade_assessment.warnings.map((warning, index) => (
                            <li key={index} className="text-yellow-300">• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {riskAssessment.data.trade_assessment.blockers.length > 0 && (
                      <div>
                        <p className="text-red-400 font-semibold">Blockers:</p>
                        <ul className="text-sm space-y-1">
                          {riskAssessment.data.trade_assessment.blockers.map((blocker, index) => (
                            <li key={index} className="text-red-300">• {blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Production Demo Workflow</h2>
            <Button
              onClick={() => runDemo()}
              disabled={demoLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Cpu className="h-4 w-4 mr-2" />
              Run Demo
            </Button>
          </div>

          {demoLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-700 rounded"></div>
            </div>
          ) : demoData ? (
            <div className="space-y-6">
              <Alert className="border-green-500 bg-green-900/20">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-green-400">Demo Completed Successfully</AlertTitle>
                <AlertDescription className="text-green-300">
                  {demoData.demonstration}
                </AlertDescription>
              </Alert>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Demo Workflow Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(demoData.demo_workflow).map(([step, description], index) => (
                      <div key={step} className="flex items-start space-x-3">
                        <Badge variant="outline" className="text-purple-400 border-purple-400 mt-0.5">
                          {index + 1}
                        </Badge>
                        <p className="text-sm flex-1">{description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Production Ready Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(demoData.production_ready)}
                      <span className={`font-semibold text-lg ${
                        demoData.production_ready ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {demoData.production_ready ? 'Production Ready' : 'Not Ready'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      System has been validated for production deployment
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Timestamp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">
                        {new Date(demoData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center">
                <Cpu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Click "Run Demo" to test the production deployment workflow</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDeployment;