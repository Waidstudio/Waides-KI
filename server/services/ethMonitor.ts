export interface EthPriceData {
  price: number;
  volume?: number | null;
  marketCap?: number | null;
  priceChange24h?: number | null;
  timestamp: number;
}

export class EthMonitor {
  private apiKey: string | undefined;
  private cache: { data: EthPriceData | null; timestamp: number } = { data: null, timestamp: 0 };
  private cacheDuration: number = 300000; // 5 minutes cache to prevent rate limiting

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COINGECKO_API_KEY;
  }

  async fetchEthData(): Promise<EthPriceData> {
    // Check cache first
    const now = Date.now();
    if (this.cache.data && (now - this.cache.timestamp) < this.cacheDuration) {
      return this.cache.data;
    }

    try {
      const url = this.apiKey 
        ? `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&x_cg_demo_api_key=${this.apiKey}`
        : 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true';
      
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(10000), // 10 second timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WaidesKI/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`CoinGecko API rate limit reached. Using cached data.`);
          if (this.cache.data) {
            return this.cache.data;
          }
        }
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.ethereum) {
        throw new Error('Invalid response from CoinGecko API');
      }
      
      const ethData = {
        price: data.ethereum.usd,
        volume: data.ethereum.usd_24h_vol,
        marketCap: data.ethereum.usd_market_cap,
        priceChange24h: data.ethereum.usd_24h_change,
        timestamp: Date.now()
      };

      // Update cache
      this.cache = { data: ethData, timestamp: now };
      return ethData;
    } catch (error) {
      console.error('Failed to fetch ETH data:', error);
      
      // Return cached data if available, otherwise fallback
      if (this.cache.data) {
        return this.cache.data;
      }
      
      // Fallback data to keep app running
      return {
        price: 3500,
        volume: 20000000000,
        marketCap: 420000000000,
        priceChange24h: 2.5,
        timestamp: Date.now()
      };
    }
  }

  async fetchFearGreedIndex(): Promise<number> {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      
      if (!response.ok) {
        throw new Error(`Fear & Greed API error: ${response.status}`);
      }
      
      const data = await response.json();
      return parseInt(data.data[0].value);
    } catch (error) {
      console.error('Failed to fetch Fear & Greed index:', error);
      return 50; // Return neutral value on error
    }
  }
}

// Export singleton instance
export const ethMonitor = new EthMonitor();
