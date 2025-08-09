import { useState, useEffect, useCallback, useRef } from 'react';

interface WalletWebSocketState {
  isConnected: boolean;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
  lastUpdate: number;
  smaiSikaBalance: any;
  transactions: any[];
  gatewayStatus: any;
}

interface WalletWebSocketOptions {
  autoConnect?: boolean;
  subscriptions?: string[];
  onDataUpdate?: (update: any) => void;
  onConnectionChange?: (connected: boolean) => void;
  retryInterval?: number;
}

export const useWalletWebSocket = (options: WalletWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    subscriptions = ['BALANCE_UPDATE', 'TRANSACTION_HISTORY', 'GATEWAY_STATUS'],
    onDataUpdate,
    onConnectionChange,
    retryInterval = 5000
  } = options;

  const [walletState, setWalletState] = useState<WalletWebSocketState>({
    isConnected: false,
    connectionHealth: 'disconnected',
    lastUpdate: 0,
    smaiSikaBalance: null,
    transactions: [],
    gatewayStatus: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/wallet`;
      
      console.log('💰 Connecting to Wallet WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('💰 Wallet WebSocket connected');
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          connectionHealth: 'excellent'
        }));

        onConnectionChange?.(true);

        // Subscribe to data types
        if (subscriptions.length > 0) {
          wsRef.current?.send(JSON.stringify({
            type: 'SUBSCRIBE',
            payload: { dataTypes: subscriptions },
            timestamp: Date.now()
          }));
        }

        // Start heartbeat
        startHeartbeat();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          
          setWalletState(prev => {
            const newState = {
              ...prev,
              lastUpdate: Date.now(),
              connectionHealth: 'excellent' as const
            };

            // Handle specific data updates
            switch (update.payload?.dataType) {
              case 'BALANCE_UPDATE':
                newState.smaiSikaBalance = update.payload.data;
                break;
              
              case 'TRANSACTION_HISTORY':
                newState.transactions = update.payload.data;
                break;
              
              case 'TRANSACTION_UPDATE':
                // Update specific transaction in history
                if (update.payload.data) {
                  const updatedTransactions = [...prev.transactions];
                  const index = updatedTransactions.findIndex(tx => tx.id === update.payload.data.id);
                  if (index !== -1) {
                    updatedTransactions[index] = update.payload.data;
                  } else {
                    updatedTransactions.unshift(update.payload.data);
                  }
                  newState.transactions = updatedTransactions;
                }
                break;
              
              case 'GATEWAY_STATUS':
                newState.gatewayStatus = update.payload.data;
                break;
            }
            
            return newState;
          });

          onDataUpdate?.(update);
          
        } catch (error) {
          console.error('💰 Failed to parse wallet message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('💰 Wallet WebSocket disconnected:', event.code);
        setWalletState(prev => ({
          ...prev,
          isConnected: false,
          connectionHealth: 'disconnected'
        }));

        onConnectionChange?.(false);
        stopHeartbeat();

        // Attempt reconnection with exponential backoff
        if (autoConnect) {
          const timeout = Math.min(retryInterval * 2, 30000); // Max 30 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('💰 Wallet WebSocket error:', error);
        setWalletState(prev => ({
          ...prev,
          connectionHealth: 'poor'
        }));
      };

    } catch (error) {
      console.error('💰 Failed to create Wallet WebSocket connection:', error);
      
      // Retry connection
      if (autoConnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, retryInterval);
      }
    }
  }, [autoConnect, subscriptions, onDataUpdate, onConnectionChange, retryInterval]);

  const startHeartbeat = useCallback(() => {
    const sendHeartbeat = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'HEARTBEAT',
          timestamp: Date.now()
        }));
      }
    };

    sendHeartbeat();
    heartbeatTimeoutRef.current = setInterval(sendHeartbeat, 25000); // Every 25 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopHeartbeat();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect]);

  // Manual connection control
  const connect = useCallback(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    stopHeartbeat();
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, [stopHeartbeat]);

  // Request fresh balance
  const requestBalance = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'BALANCE_REQUEST',
        timestamp: Date.now()
      }));
    }
  }, []);

  // Subscribe to additional data types
  const subscribe = useCallback((dataTypes: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE',
        payload: { dataTypes },
        timestamp: Date.now()
      }));
    }
  }, []);

  // Unsubscribe from data types
  const unsubscribe = useCallback((dataTypes: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        payload: { dataTypes },
        timestamp: Date.now()
      }));
    }
  }, []);

  return {
    // Connection state
    isConnected: walletState.isConnected,
    connectionHealth: walletState.connectionHealth,
    lastUpdate: walletState.lastUpdate,
    
    // Wallet data
    smaiSikaBalance: walletState.smaiSikaBalance,
    transactions: walletState.transactions,
    gatewayStatus: walletState.gatewayStatus,
    
    // Connection controls
    connect,
    disconnect,
    requestBalance,
    subscribe,
    unsubscribe
  };
};