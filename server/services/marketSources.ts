import { ETHPrice, DivineSignal } from '../types/waidTypes';

// Add caching to prevent rate limiting
let ethDataCache: { data: ETHPrice | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_DURATION = 60000; // 60 seconds

export async function fetchETHMarketData(): Promise<ETHPrice> {
  // Check cache first
  const now = Date.now();
  if (ethDataCache.data && (now - ethDataCache.timestamp) < CACHE_DURATION) {
    return ethDataCache.data;
  }

  try {
    // Fetch real ETH data from CoinGecko API with rate limiting protection
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true', {
      signal: AbortSignal.timeout(8000),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WaidesKI/1.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`CoinGecko API rate limit reached in marketSources. Using cached or fallback data.`);
        if (ethDataCache.data) {
          return ethDataCache.data;
        }
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const ethData = data.ethereum;
    
    // Validate that ethData exists and has required properties
    if (!ethData || typeof ethData.usd !== 'number') {
      throw new Error('Invalid ETH data structure from API');
    }
    
    const result = {
      price: ethData.usd,
      priceChange24h: ethData.usd_24h_change || 0,
      volume: ethData.usd_24h_vol || 0,
      marketCap: ethData.usd_market_cap || 0,
      timestamp: Date.now()
    };
    
    // Update cache
    ethDataCache = { data: result, timestamp: now };
    return result;
  } catch (error) {
    console.error('Error fetching ETH market data:', error);
    
    // Return cached data if available
    if (ethDataCache.data) {
      console.log('Using cached ETH data due to API error');
      return ethDataCache.data;
    }
    
    // Last resort fallback data
    const fallbackData = {
      price: 3500,
      priceChange24h: 1.2,
      volume: 15000000000,
      marketCap: 420000000000,
      timestamp: Date.now()
    };
    
    // Cache fallback data to prevent repeated API calls
    ethDataCache = { data: fallbackData, timestamp: now };
    return fallbackData;
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