import requests
import time
from typing import Dict, Optional

class EthConnector:
    def __init__(self):
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Rate limiting
        
    def get_eth_price(self) -> float:
        """Get current ETH price from CoinGecko API with rate limiting"""
        current_time = time.time()
        if current_time - self.last_request_time < self.min_request_interval:
            time.sleep(self.min_request_interval - (current_time - self.last_request_time))
        
        try:
            url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            self.last_request_time = time.time()
            return response.json()['ethereum']['usd']
        except Exception as e:
            print(f"Error fetching ETH price: {e}")
            # Fallback to local API if CoinGecko fails
            try:
                fallback_response = requests.get("http://localhost:5000/api/eth", timeout=5)
                if fallback_response.status_code == 200:
                    return fallback_response.json()['ethData']['price']
            except:
                pass
            raise e
    
    def get_eth_detailed_data(self) -> Optional[Dict]:
        """Get detailed ETH market data"""
        try:
            url = "https://api.coingecko.com/api/v3/coins/ethereum"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                'price': data['market_data']['current_price']['usd'],
                'volume_24h': data['market_data']['total_volume']['usd'],
                'market_cap': data['market_data']['market_cap']['usd'],
                'price_change_24h': data['market_data']['price_change_percentage_24h'],
                'high_24h': data['market_data']['high_24h']['usd'],
                'low_24h': data['market_data']['low_24h']['usd'],
                'circulating_supply': data['market_data']['circulating_supply'],
                'timestamp': int(time.time())
            }
        except Exception as e:
            print(f"Error fetching detailed ETH data: {e}")
            return None

# Global instance
eth_connector = EthConnector()

def get_eth_price() -> float:
    """Simple function wrapper for backward compatibility"""
    return eth_connector.get_eth_price()

def get_eth_detailed_data() -> Optional[Dict]:
    """Get comprehensive ETH market data"""
    return eth_connector.get_eth_detailed_data()