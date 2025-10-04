import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface ConnectorStatus {
  code: string;
  name: string;
  marketType: string;
  status: 'connected' | 'disconnected' | 'error' | 'not_configured';
  lastChecked: number;
  latency?: number;
  error?: string;
}

interface MarketTypeStatus {
  marketType: string;
  totalConnectors: number;
  connectedCount: number;
  disconnectedCount: number;
  errorCount: number;
  connectors: ConnectorStatus[];
  associatedBots: string[];
}

interface ConnectorStatuses {
  binary: MarketTypeStatus;
  forex: MarketTypeStatus;
  spot: MarketTypeStatus;
  summary: {
    totalConnectors: number;
    totalConnected: number;
    totalDisconnected: number;
    totalErrors: number;
  };
}

export default function ConnectorMonitoringPage() {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const { data: connectorData, isLoading, refetch } = useQuery<ConnectorStatuses>({
    queryKey: ['/api/connectors/status'],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      connected: 'bg-green-500/20 text-green-400 border-green-500/30',
      disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      not_configured: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };

    return (
      <Badge className={`${variants[status] || ''} border`} data-testid={`badge-${status}`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const renderMarketTypeCard = (marketData: MarketTypeStatus, marketType: string) => {
    const marketIcons: Record<string, string> = {
      binary: '🎯',
      forex: '💱',
      spot: '💰',
    };

    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700" data-testid={`card-market-${marketType}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span>{marketIcons[marketType]}</span>
            {marketType.toUpperCase()} Market Connectors
          </CardTitle>
          <CardDescription>
            {marketData.totalConnectors} total connectors | {marketData.connectedCount} connected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg" data-testid={`stat-total-${marketType}`}>
              <div className="text-2xl font-bold text-blue-400">{marketData.totalConnectors}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg" data-testid={`stat-connected-${marketType}`}>
              <div className="text-2xl font-bold text-green-400">{marketData.connectedCount}</div>
              <div className="text-xs text-gray-400">Connected</div>
            </div>
            <div className="text-center p-3 bg-gray-500/10 rounded-lg" data-testid={`stat-disconnected-${marketType}`}>
              <div className="text-2xl font-bold text-gray-400">{marketData.disconnectedCount}</div>
              <div className="text-xs text-gray-400">Offline</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg" data-testid={`stat-errors-${marketType}`}>
              <div className="text-2xl font-bold text-red-400">{marketData.errorCount}</div>
              <div className="text-xs text-gray-400">Errors</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300 mb-2">Associated Bots:</div>
            <div className="flex flex-wrap gap-2">
              {marketData.associatedBots.map((bot) => (
                <Badge key={bot} variant="outline" className="border-blue-500/30 text-blue-400" data-testid={`badge-bot-${bot}`}>
                  {bot}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="text-sm font-medium text-gray-300 mb-2">Connectors:</div>
            {marketData.connectors.map((connector) => (
              <div
                key={connector.code}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                data-testid={`connector-${connector.code}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(connector.status)}
                  <div>
                    <div className="font-medium text-gray-200">{connector.name}</div>
                    <div className="text-xs text-gray-500">{connector.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {connector.latency && (
                    <div className="text-xs text-gray-400">
                      {connector.latency}ms
                    </div>
                  )}
                  {getStatusBadge(connector.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-emerald-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
              <div className="text-gray-300">Loading connector status...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3" data-testid="title-connector-monitoring">
              <Zap className="h-8 w-8 text-yellow-400" />
              Connector Monitoring Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Real-time status monitoring for all market-type connectors
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {connectorData && (
          <>
            <Card className="bg-gradient-to-r from-blue-900/40 to-emerald-900/40 border-blue-500/30" data-testid="card-summary">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Overview
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30" data-testid="summary-total">
                    <div className="text-3xl font-bold text-blue-400">{connectorData.summary.totalConnectors}</div>
                    <div className="text-sm text-gray-300 mt-1">Total Connectors</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30" data-testid="summary-connected">
                    <div className="text-3xl font-bold text-green-400">{connectorData.summary.totalConnected}</div>
                    <div className="text-sm text-gray-300 mt-1">Connected</div>
                  </div>
                  <div className="text-center p-4 bg-gray-500/20 rounded-lg border border-gray-500/30" data-testid="summary-disconnected">
                    <div className="text-3xl font-bold text-gray-400">{connectorData.summary.totalDisconnected}</div>
                    <div className="text-sm text-gray-300 mt-1">Disconnected</div>
                  </div>
                  <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30" data-testid="summary-errors">
                    <div className="text-3xl font-bold text-red-400">{connectorData.summary.totalErrors}</div>
                    <div className="text-sm text-gray-300 mt-1">Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700" data-testid="tabs-market-types">
                <TabsTrigger value="all" data-testid="tab-all">All Markets</TabsTrigger>
                <TabsTrigger value="binary" data-testid="tab-binary">Binary Options</TabsTrigger>
                <TabsTrigger value="forex" data-testid="tab-forex">Forex/CFD</TabsTrigger>
                <TabsTrigger value="spot" data-testid="tab-spot">Spot Exchange</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-6">
                {renderMarketTypeCard(connectorData.binary, 'binary')}
                {renderMarketTypeCard(connectorData.forex, 'forex')}
                {renderMarketTypeCard(connectorData.spot, 'spot')}
              </TabsContent>

              <TabsContent value="binary" className="mt-6">
                {renderMarketTypeCard(connectorData.binary, 'binary')}
              </TabsContent>

              <TabsContent value="forex" className="mt-6">
                {renderMarketTypeCard(connectorData.forex, 'forex')}
              </TabsContent>

              <TabsContent value="spot" className="mt-6">
                {renderMarketTypeCard(connectorData.spot, 'spot')}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
