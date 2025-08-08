import { useKonsMesh } from "@/hooks/useKonsMesh";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertTriangle, Activity } from "lucide-react";

interface KonsMeshStatusIndicatorProps {
  className?: string;
}

export default function KonsMeshStatusIndicator({ className = "" }: KonsMeshStatusIndicatorProps) {
  const { isConnected, connectionHealth, lastUpdate, ethPrice } = useKonsMesh();

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="w-3 h-3" />;
    
    switch (connectionHealth) {
      case 'excellent':
        return <Activity className="w-3 h-3 text-green-500" />;
      case 'good':
        return <Wifi className="w-3 h-3 text-blue-500" />;
      case 'poor':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      default:
        return <WifiOff className="w-3 h-3 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    return connectionHealth.charAt(0).toUpperCase() + connectionHealth.slice(1);
  };

  const getStatusColor = () => {
    if (!isConnected) return 'destructive';
    
    switch (connectionHealth) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'poor':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const timeSinceLastUpdate = lastUpdate ? Date.now() - lastUpdate : 0;
  const isStale = timeSinceLastUpdate > 60000; // 1 minute

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={getStatusColor()} className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className="text-xs">KonsMesh: {getStatusText()}</span>
      </Badge>
      
      {ethPrice && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span>ETH: ${ethPrice.price?.toFixed(2)}</span>
          {isStale && <span className="text-yellow-500">⚠</span>}
        </div>
      )}
    </div>
  );
}