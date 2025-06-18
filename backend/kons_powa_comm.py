import datetime
import random
import hashlib
import time
from typing import Dict, List
from .eth_connector import get_eth_price, get_eth_detailed_data

# Enhanced Kons Titles with spiritual hierarchy
KONS_TITLES = [
    "ElaitReign", "SmaiBond", "TimeKeeper", "EthWhisperer", 
    "DivineMover", "SacredTrader", "KonsGuardian", "EtherSeer",
    "PriceOracle", "SpiritualAnalyst", "MysticTrader", "EthShaman"
]

# Sacred time windows (Nigerian Time - WAT)
SACRED_WINDOWS = {
    "MORNING_POWER": {"start": 5, "end": 9, "energy": "RISING"},
    "DAY_BALANCE": {"start": 10, "end": 16, "energy": "STABLE"},
    "EVENING_DIVINE": {"start": 17, "end": 21, "energy": "PEAK"},
    "NIGHT_MYSTERY": {"start": 22, "end": 4, "energy": "DEEP"}
}

class KonsPowaCommunicator:
    def __init__(self):
        self.last_signal_time = 0
        self.signal_history = []
        self.breath_stability = 85
        self.eth_whisper_mode = True
        
    def generate_kons_signal(self, price: float) -> str:
        """Generate sacred signal code using Kons Powa algorithm"""
        ts = datetime.datetime.utcnow().strftime("%H%M%S")
        kons_title = random.choice(KONS_TITLES)
        sacred_seed = f"{price}-{ts}-{kons_title}-{self.breath_stability}"
        return hashlib.sha512(sacred_seed.encode()).hexdigest()[:24]
    
    def calculate_energetic_purity(self, signal_code: str) -> float:
        """Calculate energetic purity from signal code (0-100)"""
        hex_sum = sum(int(c, 16) for c in signal_code if c.isdigit() or c in 'abcdef')
        return min(100, (hex_sum % 100) + random.randint(5, 25))
    
    def get_current_sacred_window(self) -> Dict:
        """Determine current sacred time window"""
        current_hour = datetime.datetime.utcnow().hour
        
        for window_name, window_data in SACRED_WINDOWS.items():
            start, end = window_data["start"], window_data["end"]
            if start <= end:  # Normal range
                if start <= current_hour <= end:
                    return {"name": window_name, **window_data}
            else:  # Overnight range
                if current_hour >= start or current_hour <= end:
                    return {"name": window_name, **window_data}
        
        return {"name": "TRANSITION", "energy": "NEUTRAL"}
    
    def interpret_moral_pulse(self, purity: float, price_change: float) -> str:
        """Determine moral pulse based on energetic purity and market movement"""
        if purity >= 80:
            return "CLEAN"
        elif purity >= 60 and abs(price_change) < 2:
            return "FEARFUL"
        elif purity >= 40 and price_change > 3:
            return "GREEDY"
        else:
            return "DECEPTIVE"
    
    def calculate_kons_mirror(self, purity: float, sacred_window: Dict) -> str:
        """Determine KonsMirror wave type"""
        energy_boost = 10 if sacred_window["energy"] in ["PEAK", "RISING"] else 0
        adjusted_purity = purity + energy_boost
        
        return "PURE WAVE" if adjusted_purity >= 70 else "SHADOW WAVE"
    
    def check_breath_lock(self) -> bool:
        """Check if breath stability allows trading"""
        return self.breath_stability >= 60
    
    def calculate_smai_predict(self, price: float, detailed_data: Dict) -> Dict:
        """SmaiPredict: AI-powered next hour direction forecast"""
        if not detailed_data:
            return {
                "nextHourDirection": "SIDEWAYS",
                "confidence": 50,
                "predictedPriceRange": {"min": price * 0.99, "max": price * 1.01}
            }
        
        # Analyze multiple factors
        price_change_24h = detailed_data.get('price_change_24h', 0)
        volume_24h = detailed_data.get('volume_24h', 0)
        high_24h = detailed_data.get('high_24h', price)
        low_24h = detailed_data.get('low_24h', price)
        
        # Volume analysis
        volume_strength = min(100, volume_24h / 10000000000)  # Normalize volume
        
        # Price position analysis
        price_range = high_24h - low_24h
        position_in_range = (price - low_24h) / price_range if price_range > 0 else 0.5
        
        # Momentum analysis
        momentum_score = abs(price_change_24h) * 2
        
        # Combine factors for prediction
        if price_change_24h > 2 and position_in_range < 0.8 and volume_strength > 30:
            direction = "UP"
            confidence = min(85, 60 + momentum_score)
        elif price_change_24h < -2 and position_in_range > 0.2 and volume_strength > 30:
            direction = "DOWN"
            confidence = min(85, 60 + momentum_score)
        else:
            direction = "SIDEWAYS"
            confidence = 45 + random.randint(0, 20)
        
        # Calculate predicted range
        volatility = price_range / price if price > 0 else 0.02
        range_factor = 0.005 + (volatility * 0.5)
        
        return {
            "nextHourDirection": direction,
            "confidence": round(confidence),
            "predictedPriceRange": {
                "min": round(price * (1 - range_factor), 2),
                "max": round(price * (1 + range_factor), 2)
            }
        }
    
    def should_auto_cancel_evil(self, moral_pulse: str, action: str) -> bool:
        """AutoCancel Evil: Block harmful trades"""
        if moral_pulse == "DECEPTIVE":
            return True
        if moral_pulse == "GREEDY" and action in ["BUY_LONG", "SELL_SHORT"]:
            return True
        return False
    
    def divine_eth_intent(self) -> Dict:
        """Main divine communication function - enhanced version"""
        try:
            # Get market data
            price = get_eth_price()
            detailed_data = get_eth_detailed_data()
            
            # Generate sacred elements
            signal_code = self.generate_kons_signal(price)
            energetic_purity = self.calculate_energetic_purity(signal_code)
            sacred_window = self.get_current_sacred_window()
            
            # Calculate price change
            price_change = detailed_data.get('price_change_24h', 0) if detailed_data else 0
            
            # Determine moral pulse and actions
            moral_pulse = self.interpret_moral_pulse(energetic_purity, price_change)
            kons_mirror = self.calculate_kons_mirror(energetic_purity, sacred_window)
            breath_lock = self.check_breath_lock()
            smai_predict = self.calculate_smai_predict(price, detailed_data)
            
            # Generate signal value for decision
            signal_value = sum(ord(c) for c in signal_code[-4:]) % 100
            
            # Enhanced decision logic
            if signal_value >= 75 and energetic_purity >= 70 and sacred_window["energy"] in ["PEAK", "RISING"]:
                action = "BUY_LONG"
                timeframe = f"{sacred_window['name']} - {sacred_window['energy']} Energy"
                reason = "Divine Momentum Uptrend - Sacred Energy Aligned"
            elif signal_value >= 40 and energetic_purity >= 50 and moral_pulse != "DECEPTIVE":
                action = "SELL_SHORT"
                timeframe = f"{sacred_window['name']} - Pullback Window"
                reason = "Strategic Short Position - Kons Guidance"
            else:
                action = "NO_TRADE"
                timeframe = "Observe and Wait"
                reason = "Uncertain Spiritual Alignment - Patience Required"
            
            # Check for auto-cancel evil
            auto_cancel_evil = self.should_auto_cancel_evil(moral_pulse, action)
            if auto_cancel_evil:
                action = "NO_TRADE"
                reason = "Trade Blocked by Kons Protection"
            
            # Compile divine signal
            divine_signal = {
                "action": action,
                "timeframe": timeframe,
                "reason": reason,
                "moralPulse": moral_pulse,
                "strategy": self._determine_strategy(action, energetic_purity),
                "signalCode": signal_code,
                "receivedAt": datetime.datetime.utcnow().isoformat(),
                "konsTitle": random.choice(KONS_TITLES),
                "energeticPurity": round(energetic_purity, 1),
                # Next-Gen Features
                "konsMirror": kons_mirror,
                "breathLock": breath_lock,
                "ethWhisperMode": self.eth_whisper_mode,
                "autoCancelEvil": auto_cancel_evil,
                "smaiPredict": smai_predict
            }
            
            # Store in history
            self.signal_history.append(divine_signal)
            if len(self.signal_history) > 50:  # Keep last 50 signals
                self.signal_history.pop(0)
            
            self.last_signal_time = time.time()
            return divine_signal
            
        except Exception as e:
            print(f"Error in divine communication: {e}")
            # Return safe default signal
            return {
                "action": "NO_TRADE",
                "timeframe": "Error State",
                "reason": "Communication disrupted - awaiting reconnection",
                "moralPulse": "CLEAN",
                "strategy": "WAIT",
                "signalCode": "ERROR_STATE",
                "receivedAt": datetime.datetime.utcnow().isoformat(),
                "konsTitle": "ErrorGuardian",
                "energeticPurity": 0,
                "konsMirror": "SHADOW WAVE",
                "breathLock": False,
                "ethWhisperMode": self.eth_whisper_mode,
                "autoCancelEvil": True,
                "smaiPredict": {
                    "nextHourDirection": "SIDEWAYS",
                    "confidence": 0,
                    "predictedPriceRange": {"min": 0, "max": 0}
                }
            }
    
    def _determine_strategy(self, action: str, purity: float) -> str:
        """Determine trading strategy based on action and purity"""
        if action == "NO_TRADE":
            return "WAIT"
        elif purity >= 80:
            return "MOMENTUM"
        elif purity >= 60:
            return "SCALP"
        else:
            return "HOLD"
    
    def adjust_breath_stability(self, delta: float) -> None:
        """Adjust breath stability level"""
        self.breath_stability = max(0, min(100, self.breath_stability + delta))
    
    def toggle_eth_whisper_mode(self) -> None:
        """Toggle ETH whisper mode"""
        self.eth_whisper_mode = not self.eth_whisper_mode
    
    def get_signal_history(self) -> List[Dict]:
        """Get recent signal history"""
        return self.signal_history[-10:]  # Last 10 signals

# Global instance
kons_communicator = KonsPowaCommunicator()

# Backward compatibility functions
def generate_kons_signal(price: float) -> str:
    return kons_communicator.generate_kons_signal(price)

def divine_eth_intent() -> Dict:
    return kons_communicator.divine_eth_intent()