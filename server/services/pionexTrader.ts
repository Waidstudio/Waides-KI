import crypto from 'crypto';
import { EthPriceData } from './ethMonitor';

interface PionexOrder {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  quantity: string;
  price?: string;
}

interface PionexResponse {
  orderId?: string;
  status: string;
  message?: string;
  error?: string;
}

export class PionexTrader {
  private apiKey: string | undefined;
  private secretKey: string | undefined;
  private baseUrl = 'https://api.pionex.com';

  constructor() {
    this.apiKey = process.env.PIONEX_API_KEY;
    this.secretKey = process.env.PIONEX_SECRET_KEY;
  }

  private generateSignature(timestamp: string, method: string, requestPath: string, body: string = ''): string {
    if (!this.secretKey) {
      throw new Error('Pionex secret key not configured');
    }
    
    const raw = `${timestamp}${method}${requestPath}${body}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(raw)
      .digest('base64');
  }

  private async makeRequest(method: string, path: string, body?: any): Promise<any> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Pionex API credentials not configured');
    }

    const timestamp = Date.now().toString();
    const jsonBody = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method, path, jsonBody);

    const headers = {
      'PIONEX-KEY': this.apiKey,
      'PIONEX-SIGN': signature,
      'PIONEX-TIMESTAMP': timestamp,
      'Content-Type': 'application/json'
    };

    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers,
      ...(jsonBody && { body: jsonBody })
    };

    const response = await fetch(url, options);
    return response.json();
  }

  async sendOrder(order: PionexOrder): Promise<PionexResponse> {
    try {
      const result = await this.makeRequest('POST', '/api/v1/order', order);
      return {
        orderId: result.orderId,
        status: result.status || 'success',
        message: result.message
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async executeKonsTrade(
    action: 'BUY LONG' | 'SELL SHORT' | 'NO TRADE' | 'OBSERVE',
    ethPrice: number,
    quantity: number = 0.01
  ): Promise<PionexResponse> {
    if (action === 'NO TRADE' || action === 'OBSERVE') {
      return {
        status: 'skipped',
        message: `Kons Powa advises: ${action} - No trade executed`
      };
    }

    const side = action === 'BUY LONG' ? 'buy' : 'sell';
    const order: PionexOrder = {
      symbol: 'ETHUSDT',
      side,
      type: 'limit',
      quantity: quantity.toString(),
      price: ethPrice.toString()
    };

    return this.sendOrder(order);
  }

  async getAccountBalance(): Promise<any> {
    try {
      return await this.makeRequest('GET', '/api/v1/account');
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch balance'
      };
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.secretKey);
  }
}