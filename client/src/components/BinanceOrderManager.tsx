import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { BinanceOrderData } from '@/types/componentTypes';

interface OrderFormData {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT';
  quantity: string;
  price?: string;
  stopPrice?: string;
}

export default function BinanceOrderManager() {
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    symbol: 'ETHUSDT',
    side: 'BUY',
    type: 'MARKET',
    quantity: '',
    price: '',
    stopPrice: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active orders
  const { data: activeOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/binance/orders/active'],
    refetchInterval: 5000,
  });

  // Fetch order history
  const { data: orderHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/binance/orders/history'],
    refetchInterval: 10000,
  });

  // Fetch account balance
  const { data: accountBalance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['/api/binance/account/balance'],
    refetchInterval: 5000,
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      const response = await apiRequest('POST', '/api/binance/orders/place', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed",
        description: `${orderForm.side} order for ${orderForm.quantity} ${orderForm.symbol} placed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/binance/orders'] });
      // Reset form
      setOrderForm({
        symbol: 'ETHUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: '',
        price: '',
        stopPrice: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    }
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest('DELETE', `/api/binance/orders/${orderId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Order cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/binance/orders'] });
    },
    onError: (error) => {
      toast({
        title: "Cancel Failed",
        description: error instanceof Error ? error.message : "Failed to cancel order",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    if (!orderForm.quantity) {
      toast({
        title: "Invalid Order",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    if (orderForm.type === 'LIMIT' && !orderForm.price) {
      toast({
        title: "Invalid Order",
        description: "Please enter a price for limit orders",
        variant: "destructive",
      });
      return;
    }

    placeOrderMutation.mutate(orderForm);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FILLED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELED':
      case 'REJECTED':
      case 'EXPIRED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PARTIALLY_FILLED':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'CANCELED':
      case 'REJECTED':
      case 'EXPIRED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'PARTIALLY_FILLED':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Binance Order Manager</h2>
        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
          Live Trading
        </Badge>
      </div>

      {/* Account Balance */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isBalanceLoading ? (
            <div className="text-gray-400">Loading balance...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {accountBalance?.balances?.map((balance: any) => (
                balance.free > 0 && (
                  <div key={balance.asset} className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <div className="font-semibold text-white">{balance.asset}</div>
                    <div className="text-sm text-gray-300">Free: {parseFloat(balance.free).toFixed(6)}</div>
                    <div className="text-sm text-gray-300">Locked: {parseFloat(balance.locked).toFixed(6)}</div>
                  </div>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Form */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Place Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol" className="text-gray-300">Symbol</Label>
              <Input
                id="symbol"
                value={orderForm.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                placeholder="ETHUSDT"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="side" className="text-gray-300">Side</Label>
              <Select value={orderForm.side} onValueChange={(value: 'BUY' | 'SELL') => handleInputChange('side', value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Buy
                    </div>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      Sell
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-gray-300">Order Type</Label>
              <Select value={orderForm.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">Market</SelectItem>
                  <SelectItem value="LIMIT">Limit</SelectItem>
                  <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
                  <SelectItem value="STOP_LOSS_LIMIT">Stop Loss Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
              <Input
                id="quantity"
                value={orderForm.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="0.001"
                type="number"
                step="0.000001"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {orderForm.type === 'LIMIT' && (
            <div>
              <Label htmlFor="price" className="text-gray-300">Price</Label>
              <Input
                id="price"
                value={orderForm.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="3500.00"
                type="number"
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}

          {(orderForm.type === 'STOP_LOSS' || orderForm.type === 'STOP_LOSS_LIMIT') && (
            <div>
              <Label htmlFor="stopPrice" className="text-gray-300">Stop Price</Label>
              <Input
                id="stopPrice"
                value={orderForm.stopPrice}
                onChange={(e) => handleInputChange('stopPrice', e.target.value)}
                placeholder="3400.00"
                type="number"
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}

          <Button
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending}
            className={`w-full ${
              orderForm.side === 'BUY' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {placeOrderMutation.isPending ? 'Placing Order...' : `Place ${orderForm.side} Order`}
          </Button>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Active Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isOrdersLoading ? (
            <div className="text-gray-400">Loading orders...</div>
          ) : activeOrders.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No active orders</div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order: BinanceOrderData) => (
                <div key={order.orderId} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="font-semibold text-white">
                          {order.side} {order.symbol}
                        </div>
                        <div className="text-sm text-gray-300">
                          {order.origQty} @ {order.price || 'Market'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelOrderMutation.mutate(order.orderId)}
                        disabled={cancelOrderMutation.isPending}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order History */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div className="text-gray-400">Loading history...</div>
          ) : orderHistory.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No order history</div>
          ) : (
            <div className="space-y-3">
              {orderHistory.slice(0, 10).map((order: BinanceOrderData) => (
                <div key={order.orderId} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="font-semibold text-white">
                          {order.side} {order.symbol}
                        </div>
                        <div className="text-sm text-gray-300">
                          {order.executedQty}/{order.origQty} @ {order.price || 'Market'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}