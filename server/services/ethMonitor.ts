export interface EthPriceData {
  price: number;
  volume?: number;
  marketCap?: number;
  priceChange24h?: number;
  timestamp: number;
}

export class EthMonitor {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COINGECKO_API_KEY;
  }

  async fetchEthData(): Promise<EthPriceData> {
    try {
      const url = this.apiKey 
        ? `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&x_cg_demo_api_key=${this.apiKey}`
        : 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.ethereum) {
        throw new Error('Invalid response from CoinGecko API');
      }
      
      return {
        price: data.ethereum.usd,
        volume: data.ethereum.usd_24h_vol,
        marketCap: data.ethereum.usd_market_cap,
        priceChange24h: data.ethereum.usd_24h_change,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to fetch ETH data:', error);
      throw new Error('Failed to fetch ETH price data. Please check your API configuration.');
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
