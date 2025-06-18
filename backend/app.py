from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import threading
from typing import Dict, Any

from .kons_powa_comm import divine_eth_intent, kons_communicator
from .waidbot import waid_bot, run_bot
from .eth_connector import get_eth_price, get_eth_detailed_data

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global state for automated trading
automated_trading_enabled = False
auto_trade_thread = None
auto_trade_interval = 300  # 5 minutes default

class AutomatedTradingEngine:
    def __init__(self):
        self.is_running = False
        self.thread = None
        
    def start_automated_trading(self, interval: int = 300):
        """Start automated trading with specified interval (seconds)"""
        if self.is_running:
            return {"status": "already_running", "message": "Automated trading is already active"}
        
        self.is_running = True
        self.thread = threading.Thread(target=self._trading_loop, args=(interval,))
        self.thread.daemon = True
        self.thread.start()
        
        return {"status": "started", "message": f"Automated trading started with {interval}s interval"}
    
    def stop_automated_trading(self):
        """Stop automated trading"""
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)
        
        return {"status": "stopped", "message": "Automated trading stopped"}
    
    def _trading_loop(self, interval: int):
        """Main automated trading loop"""
        while self.is_running:
            try:
                result = waid_bot.run_automated_bot()
                print(f"Automated trade result: {result.get('status', 'unknown')}")
                
                # Log significant events
                if result.get('trade_result', {}).get('executed', False):
                    action = result.get('divine_signal', {}).get('action', 'UNKNOWN')
                    print(f"🤖 Automated trade executed: {action}")
                
            except Exception as e:
                print(f"Error in automated trading loop: {e}")
            
            # Wait for next iteration
            time.sleep(interval)

# Global automated trading engine
auto_engine = AutomatedTradingEngine()

@app.route('/api/signal', methods=['GET'])
def get_signal():
    """Get current divine signal from Kons Powa"""
    try:
        signal = divine_eth_intent()
        return jsonify(signal)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auto-trade', methods=['POST'])
def execute_auto_trade():
    """Execute single automated trade based on divine signal"""
    try:
        result = waid_bot.run_automated_bot()
        return jsonify({"executed": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/manual-trade', methods=['POST'])
def execute_manual_trade():
    """Execute manual trade with specified parameters"""
    try:
        data = request.get_json()
        action = data.get('action', 'NO_TRADE')
        quantity = float(data.get('quantity', 0.01))
        
        current_price = get_eth_price()
        result = waid_bot.execute_kons_trade(action, current_price, quantity)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/automated-trading/start', methods=['POST'])
def start_automated_trading():
    """Start automated trading system"""
    try:
        data = request.get_json() or {}
        interval = data.get('interval', 300)  # Default 5 minutes
        
        result = auto_engine.start_automated_trading(interval)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/automated-trading/stop', methods=['POST'])
def stop_automated_trading():
    """Stop automated trading system"""
    try:
        result = auto_engine.stop_automated_trading()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/automated-trading/status', methods=['GET'])
def get_automated_trading_status():
    """Get current automated trading status"""
    return jsonify({
        "is_running": auto_engine.is_running,
        "waid_configured": waid_bot.is_configured(),
        "last_trade_time": waid_bot.last_trade_time,
        "trade_count": len(waid_bot.trade_history)
    })

@app.route('/api/eth-price', methods=['GET'])
def get_current_eth_price():
    """Get current ETH price"""
    try:
        price = get_eth_price()
        detailed_data = get_eth_detailed_data()
        
        return jsonify({
            "price": price,
            "detailed_data": detailed_data,
            "timestamp": time.time()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/account-balance', methods=['GET'])
def get_account_balance():
    """Get Waid account balance"""
    try:
        if not waid_bot.is_configured():
            return jsonify({"error": "Waid API not configured"}), 400
        
        balance = waid_bot.get_account_balance()
        return jsonify(balance)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trade-history', methods=['GET'])
def get_trade_history():
    """Get recent trade history"""
    try:
        history = waid_bot.get_trade_history()
        stats = waid_bot.get_performance_stats()
        
        return jsonify({
            "history": history,
            "performance": stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/kons-control/breath-stability', methods=['POST'])
def adjust_breath_stability():
    """Adjust Kons breath stability"""
    try:
        data = request.get_json()
        delta = float(data.get('delta', 0))
        
        kons_communicator.adjust_breath_stability(delta)
        
        return jsonify({
            "breath_stability": kons_communicator.breath_stability,
            "message": f"Breath stability adjusted by {delta}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/kons-control/whisper-mode', methods=['POST'])
def toggle_whisper_mode():
    """Toggle ETH whisper mode"""
    try:
        kons_communicator.toggle_eth_whisper_mode()
        
        return jsonify({
            "eth_whisper_mode": kons_communicator.eth_whisper_mode,
            "message": f"ETH Whisper Mode {'activated' if kons_communicator.eth_whisper_mode else 'deactivated'}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/kons-signals/history', methods=['GET'])
def get_signal_history():
    """Get recent Kons signal history"""
    try:
        history = kons_communicator.get_signal_history()
        return jsonify({"signals": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/system-status', methods=['GET'])
def get_system_status():
    """Get comprehensive system status"""
    try:
        current_signal = divine_eth_intent()
        current_price = get_eth_price()
        
        status = {
            "timestamp": time.time(),
            "components": {
                "kons_communicator": {
                    "breath_stability": kons_communicator.breath_stability,
                    "eth_whisper_mode": kons_communicator.eth_whisper_mode,
                    "signal_count": len(kons_communicator.signal_history)
                },
                "waid_bot": {
                    "configured": waid_bot.is_configured(),
                    "trade_count": len(waid_bot.trade_history),
                    "last_trade_time": waid_bot.last_trade_time
                },
                "automated_trading": {
                    "is_running": auto_engine.is_running
                }
            },
            "current_signal": current_signal,
            "current_price": current_price
        }
        
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "service": "Waides AI Ultimate ETH Trading Bot"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("🌌 Starting Waides AI Ultimate ETH Trading Bot...")
    print("🤖 Kons Powa Divine Intelligence Activated")
    print("📊 Real-time ETH Trading System Online")
    
    # Check if Waid is configured
    if waid_bot.is_configured():
        print("✅ Waid API configured and ready")
    else:
        print("⚠️  Waid API not configured - set WAID_API_KEY and WAID_SECRET_KEY")
    
    # Run Flask app
    port = int(os.getenv('PORT', 5001))  # Use port 5001 to avoid conflict with Node.js
    app.run(host='0.0.0.0', port=port, debug=True)