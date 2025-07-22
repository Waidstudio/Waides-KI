import { ETHPrice, DivineSignal } from '../types/waidTypes';

export async function fetchETHMarketData(): Promise<ETHPrice> {
  try {
    // Fetch real ETH data from CoinGecko API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
    const data = await response.json();
    
    const ethData = data.ethereum;
    
    return {
      price: ethData.usd,
      priceChange24h: ethData.usd_24h_change || 0,
      volume: ethData.usd_24h_vol || 0,
      marketCap: ethData.usd_market_cap || 0,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching ETH market data:', error);
    // Return fallback data if API fails
    return {
      price: 3000,
      priceChange24h: 0,
      volume: 1000000,
      marketCap: 360000000000,
      timestamp: Date.now()
    };
  }
}

export async function fetchDivineSignal(): Promise<DivineSignal> {
  // Generate divine signal based on market conditions and time
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Calculate energetic purity based on time and market alignment
  const energeticPurity = Math.round(50 + Math.sin((hour * 60 + minute) / 100) * 30);
  
  // Determine breath lock based on time patterns
  const breathLock = (hour >= 9 && hour <= 16) && (minute % 15 < 5);
  
  // Generate kons mirror based on purity
  const konsMirror = energeticPurity > 70 ? 'PURE WAVE' : 
                     energeticPurity > 50 ? 'BALANCED FLOW' : 'TURBULENT';
  
  // Auto cancel evil during high volatility periods
  const autoCancelEvil = energeticPurity < 30 || (hour >= 0 && hour <= 6);
  
  return {
    energeticPurity,
    breathLock,
    konsMirror,
    autoCancelEvil,
    timestamp: now.toISOString()
  };
}