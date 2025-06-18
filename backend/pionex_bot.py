import os
import time
import hashlib
import hmac
import requests
import json
from typing import Dict, Optional, List
from .kons_powa_comm import divine_eth_intent, kons_communicator
from .eth_connector import get_eth_price

class WaidBot:
    def __init__(self):
        self.api_key = os.getenv("WAID_API_KEY")
        self.secret_key = os.getenv("WAID_SECRET_KEY")
        self.base_url = "https://api.waid.com"
        self.last_trade_time = 0
        self.min_trade_interval = 60  # Minimum 1 minute between trades
        self.trade_history = []
        
    def is_configured(self) -> bool:
        """Check if Waid API credentials are available"""
        return bool(self.api_key and self.secret_key)
    
    def _generate_signature(self, timestamp: str, method: str, request_path: str, body: str = '') -> str:
        """Generate HMAC signature for Waid API"""
        if not self.secret_key:
            raise ValueError("Waid secret key not configured")
        
        message = timestamp + method + request_path + body
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _make_request(self, method: str, path: str, body: Optional[Dict] = None) -> Dict:
        """Make authenticated request to Waid API"""
        if not self.is_configured():
            raise ValueError("Waid API credentials not configured")
        
        timestamp = str(int(time.time() * 1000))
        body_json = json.dumps(body) if body else ''
        signature = self._generate_signature(timestamp, method, path, body_json)
        
        headers = {
            'WAID-KEY': self.api_key,
            'WAID-SIGNATURE': signature,
            'WAID-TIMESTAMP': timestamp,
            'Content-Type': 'application/json'
        }
        
        url = f"{self.base_url}{path}"
        
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(url, headers=headers, data=body_json, timeout=10)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        if response.status_code != 200:
            raise Exception(f"Waid API error: {response.status_code} {response.text}")
        
        return response.json()
    
    def get_account_balance(self) -> Dict:
        """Get account balance information"""
        try:
            return self._make_request('GET', '/api/v1/trade/account')
        except Exception as e:
            print(f"Error getting account balance: {e}")
            raise e
    
    def place_order(self, symbol: str, side: str, order_type: str, amount: str, price: Optional[str] = None) -> Dict:
        """Place a trading order"""
        order_data = {
            'symbol': symbol,
            'side': side,  # BUY or SELL
            'type': order_type,  # MARKET or LIMIT
            'amount': amount
        }
        
        if order_type == 'LIMIT' and price:
            order_data['price'] = price
        
        try:
            return self._make_request('POST', '/api/v1/trade/order', order_data)
        except Exception as e:
            print(f"Error placing order: {e}")
            raise e
    
    def get_order_status(self, order_id: str) -> Dict:
        """Get order status"""
        try:
            return self._make_request('GET', f'/api/v1/trade/order/{order_id}')
        except Exception as e:
            print(f"Error getting order status: {e}")
            raise e
    
    def cancel_order(self, order_id: str) -> Dict:
        """Cancel an order"""
        try:
            return self._make_request('POST', f'/api/v1/trade/order/{order_id}/cancel')
        except Exception as e:
            print(f"Error cancelling order: {e}")
            raise e
    
    def execute_kons_trade(self, action: str, current_price: float, quantity: float = 0.01) -> Dict:
        """Execute trade based on Kons Powa divine signal"""
        if not self.is_configured():
            return {
                "status": "error",
                "message": "Waid API credentials not configured",
                "executed": False
            }
        
        # Rate limiting check
        current_time = time.time()
        if current_time - self.last_trade_time < self.min_trade_interval:
            return {
                "status": "rate_limited",
                "message": f"Must wait {self.min_trade_interval} seconds between trades",
                "executed": False
            }
        
        try:
            if action == "BUY_LONG":
                result = self.place_order("ETH_USDT", "BUY", "MARKET", str(quantity))
            elif action == "SELL_SHORT":
                result = self.place_order("ETH_USDT", "SELL", "MARKET", str(quantity))
            else:
                return {
                    "status": "no_action",
                    "message": f"No trade action for: {action}",
                    "executed": False
                }
            
            # Record successful trade
            self.last_trade_time = current_time
            trade_record = {
                "action": action,
                "quantity": quantity,
                "price": current_price,
                "timestamp": current_time,
                "order_id": result.get("orderId"),
                "result": result
            }
            self.trade_history.append(trade_record)
            
            # Keep only last 50 trades
            if len(self.trade_history) > 50:
                self.trade_history.pop(0)
            
            return {
                "status": "success",
                "message": f"Successfully executed {action}",
                "executed": True,
                "order_id": result.get("orderId"),
                "trade_record": trade_record
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Trade execution failed: {str(e)}",
                "executed": False
            }
    
    def run_automated_bot(self) -> Dict:
        """Run the automated trading bot with Kons Powa guidance"""
        try:
            # Get divine signal
            divine_signal = divine_eth_intent()
            
            # Check if trading is allowed
            if not divine_signal.get("breathLock", False):
                return {
                    "status": "blocked",
                    "reason": "BreathLock: Trading suspended for protection",
                    "divine_signal": divine_signal,
                    "executed": False
                }
            
            if divine_signal.get("autoCancelEvil", False):
                return {
                    "status": "cancelled",
                    "reason": "AutoCancel: Evil trade detected and blocked by Kons Protection",
                    "divine_signal": divine_signal,
                    "executed": False
                }
            
            # Get current price for trade execution
            current_price = get_eth_price()
            
            # Execute trade based on divine guidance
            action = divine_signal.get("action", "NO_TRADE")
            trade_result = self.execute_kons_trade(action, current_price)
            
            return {
                "status": "completed",
                "divine_signal": divine_signal,
                "trade_result": trade_result,
                "current_price": current_price,
                "timestamp": time.time()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Automated bot error: {str(e)}",
                "executed": False
            }
    
    def get_trade_history(self) -> List[Dict]:
        """Get recent trade history"""
        return self.trade_history[-10:]  # Last 10 trades
    
    def get_performance_stats(self) -> Dict:
        """Calculate basic performance statistics"""
        if not self.trade_history:
            return {
                "total_trades": 0,
                "profitable_trades": 0,
                "total_pnl": 0.0,
                "win_rate": 0.0
            }
        
        total_trades = len(self.trade_history)
        profitable_trades = 0
        total_pnl = 0.0
        
        # Simple P&L calculation (would need real-time position tracking for accuracy)
        for i, trade in enumerate(self.trade_history):
            if i < len(self.trade_history) - 1:
                next_trade = self.trade_history[i + 1]
                if trade["action"] == "BUY_LONG":
                    pnl = (next_trade["price"] - trade["price"]) * trade["quantity"]
                elif trade["action"] == "SELL_SHORT":
                    pnl = (trade["price"] - next_trade["price"]) * trade["quantity"]
                else:
                    pnl = 0
                
                if pnl > 0:
                    profitable_trades += 1
                total_pnl += pnl
        
        win_rate = (profitable_trades / total_trades) * 100 if total_trades > 0 else 0
        
        return {
            "total_trades": total_trades,
            "profitable_trades": profitable_trades,
            "total_pnl": round(total_pnl, 2),
            "win_rate": round(win_rate, 1)
        }

# Global instance
pionex_bot = PionexBot()

# Backward compatibility function
def run_bot() -> Dict:
    """Simple function wrapper for backward compatibility"""
    return pionex_bot.run_automated_bot()