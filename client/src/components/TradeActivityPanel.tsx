import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame, TrendingUp, Activity, Link as LinkIcon, DollarSign } from "lucide-react";

interface Trade {
  id: string;
  timestamp: number;
  action: string;
  asset?: string;
  symbol?: string;
  connector?: string;
  stake?: number;
  amount?: number;
  result?: 'WIN' | 'LOSS' | 'PENDING';
  profitLoss: number;
  confidence: number;
  reason?: string;
}

interface TradeActivityPanelProps {
  botName: string;
  trades: Trade[];
  performance: {
    totalTrades: number;
    winRate: number;
    profit: number;
    currentWinningStreak?: number;
    longestWinningStreak?: number;
  };
  activeConnector?: string;
  profitSharing?: {
    userShare: number;
    platformShare: number;
  };
  marketType?: 'binary' | 'forex' | 'spot';
}

export function TradeActivityPanel({
  botName,
  trades,
  performance,
  activeConnector,
  profitSharing,
  marketType = 'binary'
}: TradeActivityPanelProps) {
  
  const formatTradeLog = (trade: Trade) => {
    const timestamp = new Date(trade.timestamp).toLocaleTimeString();
    const resultIcon = trade.result === 'WIN' ? '✅' : trade.result === 'LOSS' ? '❌' : '⏳';
    const asset = trade.asset || trade.symbol || 'Unknown';
    const connector = trade.connector || activeConnector || 'Platform';
    
    if (marketType === 'binary') {
      return `${resultIcon} ${botName} ${trade.action} on ${asset} via ${connector} - $${trade.stake?.toFixed(2) || '0.00'} stake${trade.result !== 'PENDING' ? ` - ${trade.result} (${trade.profitLoss > 0 ? '+' : ''}$${trade.profitLoss.toFixed(2)})` : ''}`;
    } else if (marketType === 'forex') {
      return `${resultIcon} ${botName} ${trade.action} ${asset} via ${connector} - ${trade.amount?.toFixed(2) || '0.00'} lots${trade.result !== 'PENDING' ? ` - ${trade.result} (${trade.profitLoss > 0 ? '+' : ''}$${trade.profitLoss.toFixed(2)})` : ''}`;
    } else {
      return `${resultIcon} ${botName} ${trade.action} ${asset} - $${trade.amount?.toFixed(2) || '0.00'}${trade.result !== 'PENDING' ? ` - ${trade.result} (${trade.profitLoss > 0 ? '+' : ''}$${trade.profitLoss.toFixed(2)})` : ''}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Win Rate */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Win Rate</p>
                <p className="text-2xl font-bold text-white">{performance.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Current Winning Streak */}
        {performance.currentWinningStreak !== undefined && (
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current Streak</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    {performance.currentWinningStreak} wins
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30">
                  Best: {performance.longestWinningStreak || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Connector */}
        {activeConnector && (
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-400/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Trading via</p>
                  <p className="text-lg font-bold text-white truncate">{activeConnector}</p>
                </div>
                <LinkIcon className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profit Sharing */}
        {profitSharing && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-400/30">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-slate-400">Profit Split</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                    You: {profitSharing.userShare}%
                  </Badge>
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                    Fee: {profitSharing.platformShare}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Live Trade Logs */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-blue-400/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Activity className="h-5 w-5" />
            Live Trade Activity
          </CardTitle>
          <CardDescription className="text-slate-400">
            Real-time execution logs from {botName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full rounded-md border border-slate-700 p-4">
            {trades.length > 0 ? (
              <div className="space-y-2">
                {trades.map((trade) => (
                  <div
                    key={trade.id}
                    className={`p-3 rounded-lg text-sm font-mono ${
                      trade.result === 'WIN'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                        : trade.result === 'LOSS'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                        : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1">{formatTradeLog(trade)}</p>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {trade.reason && (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        {trade.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Activity className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-sm">No trades executed yet</p>
                <p className="text-xs">Start the bot to see live activity</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
