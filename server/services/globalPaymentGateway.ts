// Global Payment Gateway Service - Real-time processing for Africa, Asia, and America
export interface PaymentProvider {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'digital_wallet' | 'card_payment';
  countries: string[];
  currencies: string[];
  fees: {
    fixed: number;
    percentage: number;
  };
  processingTime: string;
  logo: string;
  isActive: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  providerId: string;
  userId: string;
  country: string;
  accountDetails: any;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: string;
  fees: number;
  reference: string;
  paymentUrl?: string;
  instructions?: string;
  estimatedTime?: string;
}

export class GlobalPaymentGateway {
  private providers: PaymentProvider[] = [
    // AFRICAN PAYMENT PROVIDERS
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      countries: ['NG', 'GH', 'UG', 'RW', 'CI', 'CM', 'BJ', 'ZM'],
      currencies: ['NGN', 'GHS', 'UGX', 'RWF', 'XOF', 'XAF', 'XOF', 'ZMW'],
      fees: { fixed: 0, percentage: 1.5 },
      processingTime: '1-3 minutes',
      logo: '📱',
      isActive: true
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      type: 'mobile_money',
      countries: ['NG', 'KE', 'UG', 'TZ', 'RW', 'ZM', 'MW', 'MG'],
      currencies: ['NGN', 'KES', 'UGX', 'TZS', 'RWF', 'ZMW', 'MWK', 'MGA'],
      fees: { fixed: 0, percentage: 1.2 },
      processingTime: '1-3 minutes',
      logo: '📱',
      isActive: true
    },
    {
      id: 'vodacom_mpesa',
      name: 'Vodacom M-Pesa',
      type: 'mobile_money',
      countries: ['TZ', 'DRC', 'MZ', 'LS'],
      currencies: ['TZS', 'CDF', 'MZN', 'LSL'],
      fees: { fixed: 0, percentage: 1.8 },
      processingTime: '1-5 minutes',
      logo: '📱',
      isActive: true
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      type: 'mobile_money',
      countries: ['CI', 'SN', 'ML', 'BF', 'NE', 'GN', 'CM', 'CF'],
      currencies: ['XOF', 'XOF', 'XOF', 'XOF', 'XOF', 'GNF', 'XAF', 'XAF'],
      fees: { fixed: 0, percentage: 2.0 },
      processingTime: '2-5 minutes',
      logo: '🧡',
      isActive: true
    },
    {
      id: 'safaricom_mpesa',
      name: 'Safaricom M-Pesa',
      type: 'mobile_money',
      countries: ['KE'],
      currencies: ['KES'],
      fees: { fixed: 0, percentage: 1.0 },
      processingTime: '30 seconds - 2 minutes',
      logo: '💚',
      isActive: true
    },
    {
      id: 'paystack',
      name: 'Paystack',
      type: 'card_payment',
      countries: ['NG', 'GH', 'ZA', 'KE'],
      currencies: ['NGN', 'GHS', 'ZAR', 'KES'],
      fees: { fixed: 100, percentage: 1.5 },
      processingTime: 'Instant',
      logo: '💳',
      isActive: true
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'card_payment',
      countries: ['NG', 'GH', 'KE', 'UG', 'ZA', 'RW', 'TZ'],
      currencies: ['NGN', 'GHS', 'KES', 'UGX', 'ZAR', 'RWF', 'TZS'],
      fees: { fixed: 0, percentage: 1.4 },
      processingTime: 'Instant',
      logo: '🌊',
      isActive: true
    },
    {
      id: 'chipper_cash',
      name: 'Chipper Cash',
      type: 'digital_wallet',
      countries: ['NG', 'GH', 'KE', 'UG', 'TZ', 'RW', 'ZA'],
      currencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'RWF', 'ZAR'],
      fees: { fixed: 0, percentage: 0.5 },
      processingTime: 'Instant',
      logo: '🐿️',
      isActive: true
    },

    // ASIAN PAYMENT PROVIDERS
    {
      id: 'alipay',
      name: 'Alipay',
      type: 'digital_wallet',
      countries: ['CN', 'HK', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID'],
      currencies: ['CNY', 'HKD', 'SGD', 'MYR', 'THB', 'VND', 'PHP', 'IDR'],
      fees: { fixed: 0, percentage: 0.8 },
      processingTime: 'Instant',
      logo: '💙',
      isActive: true
    },
    {
      id: 'wechat_pay',
      name: 'WeChat Pay',
      type: 'digital_wallet',
      countries: ['CN', 'HK', 'MY', 'TH', 'SG'],
      currencies: ['CNY', 'HKD', 'MYR', 'THB', 'SGD'],
      fees: { fixed: 0, percentage: 0.6 },
      processingTime: 'Instant',
      logo: '💚',
      isActive: true
    },
    {
      id: 'paytm',
      name: 'Paytm',
      type: 'digital_wallet',
      countries: ['IN'],
      currencies: ['INR'],
      fees: { fixed: 0, percentage: 1.0 },
      processingTime: 'Instant',
      logo: '🔵',
      isActive: true
    },
    {
      id: 'upi',
      name: 'UPI (Unified Payments)',
      type: 'bank_transfer',
      countries: ['IN'],
      currencies: ['INR'],
      fees: { fixed: 0, percentage: 0.0 },
      processingTime: 'Instant',
      logo: '🇮🇳',
      isActive: true
    },
    {
      id: 'grabpay',
      name: 'GrabPay',
      type: 'digital_wallet',
      countries: ['SG', 'MY', 'TH', 'PH', 'VN', 'ID'],
      currencies: ['SGD', 'MYR', 'THB', 'PHP', 'VND', 'IDR'],
      fees: { fixed: 0, percentage: 1.2 },
      processingTime: 'Instant',
      logo: '🚗',
      isActive: true
    },
    {
      id: 'gcash',
      name: 'GCash',
      type: 'digital_wallet',
      countries: ['PH'],
      currencies: ['PHP'],
      fees: { fixed: 0, percentage: 1.0 },
      processingTime: 'Instant',
      logo: '📱',
      isActive: true
    },
    {
      id: 'dana',
      name: 'DANA',
      type: 'digital_wallet',
      countries: ['ID'],
      currencies: ['IDR'],
      fees: { fixed: 0, percentage: 0.9 },
      processingTime: 'Instant',
      logo: '💙',
      isActive: true
    },
    {
      id: 'promptpay',
      name: 'PromptPay',
      type: 'bank_transfer',
      countries: ['TH'],
      currencies: ['THB'],
      fees: { fixed: 0, percentage: 0.0 },
      processingTime: 'Instant',
      logo: '🇹🇭',
      isActive: true
    },

    // AMERICAN PAYMENT PROVIDERS
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'card_payment',
      countries: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
      currencies: ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN'],
      fees: { fixed: 30, percentage: 2.9 },
      processingTime: 'Instant',
      logo: '💳',
      isActive: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital_wallet',
      countries: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'UY', 'EC'],
      currencies: ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'UYU', 'USD'],
      fees: { fixed: 0, percentage: 3.4 },
      processingTime: 'Instant',
      logo: '💙',
      isActive: true
    },
    {
      id: 'venmo',
      name: 'Venmo',
      type: 'digital_wallet',
      countries: ['US'],
      currencies: ['USD'],
      fees: { fixed: 0, percentage: 0.0 },
      processingTime: 'Instant',
      logo: '💙',
      isActive: true
    },
    {
      id: 'cashapp',
      name: 'Cash App',
      type: 'digital_wallet',
      countries: ['US', 'GB'],
      currencies: ['USD', 'GBP'],
      fees: { fixed: 0, percentage: 1.5 },
      processingTime: 'Instant',
      logo: '💚',
      isActive: true
    },
    {
      id: 'zelle',
      name: 'Zelle',
      type: 'bank_transfer',
      countries: ['US'],
      currencies: ['USD'],
      fees: { fixed: 0, percentage: 0.0 },
      processingTime: 'Instant',
      logo: '🏦',
      isActive: true
    },
    {
      id: 'interac',
      name: 'Interac e-Transfer',
      type: 'bank_transfer',
      countries: ['CA'],
      currencies: ['CAD'],
      fees: { fixed: 100, percentage: 0.0 },
      processingTime: '5-30 minutes',
      logo: '🇨🇦',
      isActive: true
    },
    {
      id: 'pix',
      name: 'Pix',
      type: 'bank_transfer',
      countries: ['BR'],
      currencies: ['BRL'],
      fees: { fixed: 0, percentage: 0.0 },
      processingTime: 'Instant',
      logo: '🇧🇷',
      isActive: true
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      type: 'digital_wallet',
      countries: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      currencies: ['ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU'],
      fees: { fixed: 0, percentage: 2.8 },
      processingTime: 'Instant',
      logo: '💛',
      isActive: true
    }
  ];

  // Get providers for a specific country
  getProvidersByCountry(countryCode: string): PaymentProvider[] {
    return this.providers.filter(provider => 
      provider.countries.includes(countryCode) && provider.isActive
    );
  }

  // Get provider by ID
  getProvider(providerId: string): PaymentProvider | null {
    return this.providers.find(provider => provider.id === providerId) || null;
  }

  // Process payment with real-time updates
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.getProvider(request.providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Calculate fees
    const fees = provider.fees.fixed + (request.amount * provider.fees.percentage / 100);
    const transactionId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Simulate real-time payment processing based on provider type
      await this.simulatePaymentProcessing(provider.type, provider.processingTime);

      // Generate response based on provider type
      const response: PaymentResponse = {
        success: true,
        transactionId,
        status: this.getInitialStatus(provider.type),
        amount: request.amount,
        currency: request.currency,
        fees,
        reference: `REF_${transactionId}`,
        estimatedTime: provider.processingTime
      };

      // Add payment-specific data
      if (provider.type === 'mobile_money') {
        response.instructions = `Send ${request.currency} ${request.amount} to merchant code. You will receive an SMS confirmation.`;
      } else if (provider.type === 'card_payment') {
        response.paymentUrl = `https://checkout.${provider.id}.com/pay/${transactionId}`;
      } else if (provider.type === 'digital_wallet') {
        response.paymentUrl = `${provider.name}://pay?amount=${request.amount}&ref=${transactionId}`;
      } else if (provider.type === 'bank_transfer') {
        response.instructions = `Transfer ${request.currency} ${request.amount} to account: ${this.generateAccountNumber()}. Reference: ${response.reference}`;
      }

      return response;
    } catch (error) {
      return {
        success: false,
        transactionId,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        fees: 0,
        reference: `ERR_${transactionId}`
      };
    }
  }

  // Simulate different processing times
  private async simulatePaymentProcessing(type: string, processingTime: string): Promise<void> {
    let delay = 1000; // Default 1 second

    if (processingTime.includes('Instant')) {
      delay = 500;
    } else if (processingTime.includes('30 seconds')) {
      delay = 1500;
    } else if (processingTime.includes('1-3 minutes')) {
      delay = 2000;
    } else if (processingTime.includes('2-5 minutes')) {
      delay = 3000;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Get initial payment status
  private getInitialStatus(type: string): 'pending' | 'processing' | 'completed' {
    switch (type) {
      case 'mobile_money':
        return 'pending';
      case 'bank_transfer':
        return 'processing';
      case 'card_payment':
      case 'digital_wallet':
        return 'completed';
      default:
        return 'pending';
    }
  }

  // Generate mock account number for bank transfers
  private generateAccountNumber(): string {
    return Math.random().toString().substr(2, 10);
  }

  // Get all supported countries
  getSupportedCountries(): Array<{code: string, name: string, providers: number}> {
    const countryMap = new Map();
    
    this.providers.forEach(provider => {
      provider.countries.forEach(country => {
        const current = countryMap.get(country) || { count: 0, name: this.getCountryName(country) };
        countryMap.set(country, { ...current, count: current.count + 1 });
      });
    });

    const countries = Array.from(countryMap.entries()).map(([code, data]) => ({
      code,
      name: (data as any).name,
      providers: (data as any).count
    }));

    return countries.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Helper to get country names
  private getCountryName(code: string): string {
    const countryNames: Record<string, string> = {
      'NG': 'Nigeria', 'GH': 'Ghana', 'KE': 'Kenya', 'UG': 'Uganda', 'ZA': 'South Africa',
      'RW': 'Rwanda', 'TZ': 'Tanzania', 'ZM': 'Zambia', 'MW': 'Malawi', 'MG': 'Madagascar',
      'CI': 'Côte d\'Ivoire', 'SN': 'Senegal', 'ML': 'Mali', 'BF': 'Burkina Faso',
      'NE': 'Niger', 'GN': 'Guinea', 'CM': 'Cameroon', 'CF': 'Central African Republic',
      'DRC': 'Democratic Republic of Congo', 'MZ': 'Mozambique', 'LS': 'Lesotho',
      'BJ': 'Benin', 'CN': 'China', 'HK': 'Hong Kong', 'SG': 'Singapore', 'MY': 'Malaysia',
      'TH': 'Thailand', 'VN': 'Vietnam', 'PH': 'Philippines', 'ID': 'Indonesia',
      'IN': 'India', 'US': 'United States', 'CA': 'Canada', 'MX': 'Mexico', 'BR': 'Brazil',
      'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'UY': 'Uruguay',
      'EC': 'Ecuador', 'GB': 'United Kingdom'
    };
    
    return countryNames[code] || code;
  }

  // Get real-time payment status
  async getPaymentStatus(transactionId: string): Promise<{status: string, lastUpdate: string}> {
    // Simulate status check
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      status: randomStatus,
      lastUpdate: new Date().toISOString()
    };
  }

  // Webhook simulation for real-time updates
  async simulateWebhookUpdate(transactionId: string, newStatus: string): Promise<void> {
    console.log(`🔄 Payment Update: ${transactionId} -> ${newStatus}`);
    // In a real implementation, this would send WebSocket updates to the frontend
  }
}

export const globalPaymentGateway = new GlobalPaymentGateway();