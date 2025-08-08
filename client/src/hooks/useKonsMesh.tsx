/**
 * KonsMesh React Hook - Real-time Data Integration
 * Connects React components to KonsMesh data distribution system
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface EthPriceData {
  price: number;
  volume?: number | null;
  marketCap?: number | null;
  priceChange24h?: number | null;
  timestamp: number;
}

export interface MeshDataUpdate {
  type: 'ETH_PRICE' | 'MARKET_DATA' | 'SYSTEM_ALERT' | 'BOT_STATUS' | 'TRADING_SIGNAL';
  timestamp: number;
  data: any;
  source: string;
  priority: 'low' | 'normal' | 'high' | 'critical' | 'divine';
}

export interface KonsMeshState {
  isConnected: boolean;
  ethPrice: EthPriceData | null;
  lastUpdate: number;
  systemAlerts: any[];
  botStatuses: Record<string, any>;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface UseKonsMeshOptions {
  autoConnect?: boolean;
  subscriptions?: string[];
  onDataUpdate?: (update: MeshDataUpdate) => void;
  onConnectionChange?: (connected: boolean) => void;
  retryInterval?: number;
}

export function useKonsMesh(options: UseKonsMeshOptions = {}) {
  const {
    autoConnect = true,
    subscriptions = ['ETH_PRICE', 'SYSTEM_ALERT'],
    onDataUpdate,
    onConnectionChange,
    retryInterval = 5000
  } = options;

  const [meshState, setMeshState] = useState<KonsMeshState>({
    isConnected: false,
    ethPrice: null,
    lastUpdate: 0,
    systemAlerts: [],
    botStatuses: {},
    connectionHealth: 'disconnected'
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionIdRef = useRef<string>(`mesh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Get initial ETH price data
  const { data: initialEthPrice } = useQuery({
    queryKey: ['/api/konsmesh/data/eth-price'],
    refetchInterval: meshState.isConnected ? false : 30000, // Stop polling when WebSocket connected
    enabled: !meshState.isConnected,
  });

  // Update initial ETH price
  useEffect(() => {
    if (initialEthPrice?.success && initialEthPrice.data && !meshState.isConnected) {
      setMeshState(prev => ({
        ...prev,
        ethPrice: initialEthPrice.data,
        lastUpdate: Date.now()
      }));
    }
  }, [initialEthPrice, meshState.isConnected]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔗 KonsMesh WebSocket connected');
        setMeshState(prev => ({
          ...prev,
          isConnected: true,
          connectionHealth: 'excellent'
        }));

        // Subscribe to data updates
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'SUBSCRIBE',
            payload: {
              clientId: subscriptionIdRef.current,
              dataTypes: subscriptions
            }
          }));
        }

        onConnectionChange?.(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update: MeshDataUpdate = JSON.parse(event.data);
          
          // Update state based on data type
          setMeshState(prev => {
            const newState = { ...prev };
            
            switch (update.type) {
              case 'ETH_PRICE':
                newState.ethPrice = update.data;
                newState.lastUpdate = update.timestamp;
                break;
              case 'SYSTEM_ALERT':
                newState.systemAlerts = [update.data, ...prev.systemAlerts].slice(0, 10); // Keep last 10
                break;
              case 'BOT_STATUS':
                newState.botStatuses[update.data.entityId] = update.data;
                break;
            }
            
            return newState;
          });

          onDataUpdate?.(update);
          
        } catch (error) {
          console.error('❌ Failed to parse KonsMesh message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 KonsMesh WebSocket disconnected:', event.code);
        setMeshState(prev => ({
          ...prev,
          isConnected: false,
          connectionHealth: 'disconnected'
        }));

        onConnectionChange?.(false);

        // Attempt reconnection
        if (autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, retryInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ KonsMesh WebSocket error:', error);
        setMeshState(prev => ({
          ...prev,
          connectionHealth: 'poor'
        }));
      };

    } catch (error) {
      console.error('❌ Failed to create KonsMesh WebSocket connection:', error);
      
      // Retry connection
      if (autoConnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, retryInterval);
      }
    }
  }, [autoConnect, subscriptions, onDataUpdate, onConnectionChange, retryInterval]);

  // Initialize connection
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, connectWebSocket]);

  // Manual connection control
  const connect = useCallback(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  // Send message to KonsMesh
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Update subscriptions
  const updateSubscriptions = useCallback((newSubscriptions: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        payload: {
          clientId: subscriptionIdRef.current,
          dataTypes: newSubscriptions
        }
      }));
    }
  }, []);

  return {
    // State
    ...meshState,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    updateSubscriptions,
    
    // Utilities
    subscriptionId: subscriptionIdRef.current
  };
}

// Specialized hooks for common use cases

export function useEthPrice() {
  const { ethPrice, isConnected, lastUpdate } = useKonsMesh({
    subscriptions: ['ETH_PRICE']
  });
  
  return {
    price: ethPrice?.price ?? 0,
    priceChange24h: ethPrice?.priceChange24h ?? 0,
    volume: ethPrice?.volume ?? 0,
    marketCap: ethPrice?.marketCap ?? 0,
    timestamp: ethPrice?.timestamp ?? Date.now(),
    isConnected,
    lastUpdate,
    isStale: lastUpdate > 0 && (Date.now() - lastUpdate) > 60000 // 1 minute
  };
}

export function useSystemAlerts() {
  const { systemAlerts, isConnected } = useKonsMesh({
    subscriptions: ['SYSTEM_ALERT']
  });
  
  return {
    alerts: systemAlerts,
    isConnected,
    unreadCount: systemAlerts.filter(alert => !alert.read).length
  };
}

export function useBotStatuses() {
  const { botStatuses, isConnected } = useKonsMesh({
    subscriptions: ['BOT_STATUS']
  });
  
  return {
    statuses: botStatuses,
    isConnected,
    activeBots: Object.values(botStatuses).filter((status: any) => status.active).length,
    totalBots: Object.keys(botStatuses).length
  };
}

export default useKonsMesh;