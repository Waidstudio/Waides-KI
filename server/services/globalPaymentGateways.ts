/**
 * Global Payment Gateway Service
 * Supports multi-continent payment processing with SmaiSika integration
 */

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'crypto' | 'card' | 'digital_wallet';
  countries: string[];
  currencies: string[];
  fees: {
    fixed: number;
    percentage: number;
  };
  processingTime: string;
  apiEndpoint?: string;
  isActive: boolean;
}

export interface LocalWalletBalance {
  currency: string;
  amount: number;
  symbol: string;
  lastUpdated: string;
}

export interface SmaiSikaWallet {
  balance: number;
  symbol: 'SS';
  lastUpdated: string;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  gateway: string;
  country: string;
  accountDetails: string;
  userId: string;
}

export interface ConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: 'SS';
  userId: string;
}

export interface FXRate {
  currency: string;
  rate: number; // How many units = 1 SS
  lastUpdated: string;
}

export class GlobalPaymentGateways {
  private gateways: PaymentGateway[] = [
    // Africa - Nigeria
    {
      id: 'paystack_ng',
      name: 'Paystack Nigeria',
      type: 'card',
      countries: ['NG'],
      currencies: ['NGN'],
      fees: { fixed: 100, percentage: 1.5 },
      processingTime: '2-5 minutes',
      isActive: true
    },
    {
      id: 'flutterwave_ng',
      name: 'Flutterwave Nigeria',
      type: 'mobile_money',
      countries: ['NG'],
      currencies: ['NGN'],
      fees: { fixed: 50, percentage: 1.0 },
      processingTime: '1-3 minutes',
      isActive: true
    },
    {
      id: 'mtn_momo_ng',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      countries: ['NG', 'GH', 'UG'],
      currencies: ['NGN', 'GHS', 'UGX'],
      fees: { fixed: 0, percentage: 0.5 },
      processingTime: '1-2 minutes',
      isActive: true
    },

    // Africa - Ghana
    {
      id: 'payvessels_gh',
      name: 'PayVessels Ghana',
      type: 'bank_transfer',
      countries: ['GH'],
      currencies: ['GHS'],
      fees: { fixed: 2, percentage: 1.2 },
      processingTime: '5-10 minutes',
      isActive: true
    },
    {
      id: 'hubtel_gh',
      name: 'Hubtel',
      type: 'mobile_money',
      countries: ['GH'],
      currencies: ['GHS'],
      fees: { fixed: 1, percentage: 0.8 },
      processingTime: '1-3 minutes',
      isActive: true
    },

    // Africa - Kenya
    {
      id: 'mpesa_ke',
      name: 'M-PESA',
      type: 'mobile_money',
      countries: ['KE'],
      currencies: ['KES'],
      fees: { fixed: 5, percentage: 0.5 },
      processingTime: '1-2 minutes',
      isActive: true
    },
    {
      id: 'equity_bank_ke',
      name: 'Equity Bank',
      type: 'bank_transfer',
      countries: ['KE'],
      currencies: ['KES'],
      fees: { fixed: 10, percentage: 0.3 },
      processingTime: '10-30 minutes',
      isActive: true
    },

    // Africa - South Africa
    {
      id: 'ozow_za',
      name: 'Ozow',
      type: 'bank_transfer',
      countries: ['ZA'],
      currencies: ['ZAR'],
      fees: { fixed: 5, percentage: 1.0 },
      processingTime: '5-15 minutes',
      isActive: true
    },
    {
      id: 'payfast_za',
      name: 'PayFast',
      type: 'card',
      countries: ['ZA'],
      currencies: ['ZAR'],
      fees: { fixed: 2, percentage: 2.9 },
      processingTime: '2-5 minutes',
      isActive: true
    },

    // Europe & UK
    {
      id: 'stripe_uk',
      name: 'Stripe UK',
      type: 'card',
      countries: ['GB'],
      currencies: ['GBP'],
      fees: { fixed: 0.2, percentage: 1.4 },
      processingTime: '2-5 minutes',
      isActive: true
    },
    {
      id: 'paypal_eu',
      name: 'PayPal Europe',
      type: 'digital_wallet',
      countries: ['GB', 'DE', 'FR', 'ES', 'IT', 'NL'],
      currencies: ['GBP', 'EUR'],
      fees: { fixed: 0.35, percentage: 3.4 },
      processingTime: '3-7 minutes',
      isActive: true
    },
    {
      id: 'klarna_eu',
      name: 'Klarna',
      type: 'bank_transfer',
      countries: ['SE', 'NO', 'DK', 'FI', 'DE'],
      currencies: ['SEK', 'NOK', 'DKK', 'EUR'],
      fees: { fixed: 0, percentage: 2.5 },
      processingTime: '5-10 minutes',
      isActive: true
    },

    // Asia
    {
      id: 'razorpay_in',
      name: 'Razorpay',
      type: 'card',
      countries: ['IN'],
      currencies: ['INR'],
      fees: { fixed: 2, percentage: 2.0 },
      processingTime: '2-5 minutes',
      isActive: true
    },
    {
      id: 'upi_in',
      name: 'UPI India',
      type: 'bank_transfer',
      countries: ['IN'],
      currencies: ['INR'],
      fees: { fixed: 0, percentage: 0 },
      processingTime: '1-2 minutes',
      isActive: true
    },
    {
      id: 'gcash_ph',
      name: 'GCash',
      type: 'digital_wallet',
      countries: ['PH'],
      currencies: ['PHP'],
      fees: { fixed: 5, percentage: 1.0 },
      processingTime: '1-3 minutes',
      isActive: true
    },
    {
      id: 'ovo_id',
      name: 'OVO',
      type: 'digital_wallet',
      countries: ['ID'],
      currencies: ['IDR'],
      fees: { fixed: 1000, percentage: 0.5 },
      processingTime: '1-2 minutes',
      isActive: true
    },

    // Americas
    {
      id: 'stripe_us',
      name: 'Stripe USA',
      type: 'card',
      countries: ['US'],
      currencies: ['USD'],
      fees: { fixed: 0.3, percentage: 2.9 },
      processingTime: '2-5 minutes',
      isActive: true
    },
    {
      id: 'paypal_us',
      name: 'PayPal USA',
      type: 'digital_wallet',
      countries: ['US', 'CA'],
      currencies: ['USD', 'CAD'],
      fees: { fixed: 0.49, percentage: 3.49 },
      processingTime: '3-7 minutes',
      isActive: true
    },
    {
      id: 'cashapp_us',
      name: 'Cash App',
      type: 'digital_wallet',
      countries: ['US'],
      currencies: ['USD'],
      fees: { fixed: 0, percentage: 1.5 },
      processingTime: '1-3 minutes',
      isActive: true
    },
    {
      id: 'mercadopago_latam',
      name: 'MercadoPago',
      type: 'digital_wallet',
      countries: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE', 'UY'],
      currencies: ['ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU'],
      fees: { fixed: 0, percentage: 3.2 },
      processingTime: '3-8 minutes',
      isActive: true
    },
    {
      id: 'pix_br',
      name: 'PIX Brazil',
      type: 'bank_transfer',
      countries: ['BR'],
      currencies: ['BRL'],
      fees: { fixed: 0, percentage: 0 },
      processingTime: '1-2 minutes',
      isActive: true
    },

    // Crypto Gateways
    {
      id: 'binance_global',
      name: 'Binance Pay',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['USDT', 'USDC', 'BTC', 'ETH'],
      fees: { fixed: 0, percentage: 0.1 },
      processingTime: '1-5 minutes',
      isActive: true
    },
    {
      id: 'coinbase_global',
      name: 'Coinbase Commerce',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['USDT', 'USDC', 'BTC', 'ETH'],
      fees: { fixed: 0, percentage: 1.0 },
      processingTime: '5-15 minutes',
      isActive: true
    }
  ];

  // FX Rates: How many units = 1 SmaiSika (SS)
  private fxRates: Record<string, number> = {
    NGN: 1000,    // 1 SS = 1000 NGN
    GHS: 80,      // 1 SS = 80 GHS
    KES: 150,     // 1 SS = 150 KES
    ZAR: 18,      // 1 SS = 18 ZAR
    USD: 0.65,    // 1 SS = 0.65 USD
    GBP: 0.52,    // 1 SS = 0.52 GBP
    EUR: 0.60,    // 1 SS = 0.60 EUR
    INR: 54,      // 1 SS = 54 INR
    PHP: 37,      // 1 SS = 37 PHP
    IDR: 10000,   // 1 SS = 10,000 IDR
    CAD: 0.88,    // 1 SS = 0.88 CAD
    BRL: 3.9,     // 1 SS = 3.9 BRL
    ARS: 650,     // 1 SS = 650 ARS
    UGX: 2400,    // 1 SS = 2400 UGX
    USDT: 0.65,   // 1 SS = 0.65 USDT
    USDC: 0.65,   // 1 SS = 0.65 USDC
    BTC: 0.000015, // 1 SS = 0.000015 BTC
    ETH: 0.00020   // 1 SS = 0.00020 ETH
  };

  getGatewaysByCountry(countryCode: string): PaymentGateway[] {
    return this.gateways.filter(gateway => 
      gateway.countries.includes(countryCode) || gateway.countries.includes('GLOBAL')
    );
  }

  getGatewaysByType(type: string): PaymentGateway[] {
    return this.gateways.filter(gateway => gateway.type === type);
  }

  getGateway(gatewayId: string): PaymentGateway | null {
    return this.gateways.find(gateway => gateway.id === gatewayId) || null;
  }

  getSupportedCountries(): Array<{code: string, name: string, gateways: number}> {
    const countryNames: Record<string, string> = {
      NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya', ZA: 'South Africa', UG: 'Uganda',
      GB: 'United Kingdom', DE: 'Germany', FR: 'France', ES: 'Spain', IT: 'Italy',
      NL: 'Netherlands', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
      IN: 'India', PH: 'Philippines', ID: 'Indonesia',
      US: 'United States', CA: 'Canada', AR: 'Argentina', BR: 'Brazil',
      CL: 'Chile', CO: 'Colombia', MX: 'Mexico', PE: 'Peru', UY: 'Uruguay',
      GLOBAL: 'Global (Crypto)'
    };

    const countryCounts: Record<string, number> = {};
    
    this.gateways.forEach(gateway => {
      gateway.countries.forEach(country => {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
    });

    return Object.entries(countryCounts)
      .map(([code, count]) => ({
        code,
        name: countryNames[code] || code,
        gateways: count
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getFXRate(currency: string): number {
    return this.fxRates[currency] || 1;
  }

  convertToSmaiSika(amount: number, currency: string): number {
    const rate = this.getFXRate(currency);
    return amount / rate;
  }

  convertFromSmaiSika(ssAmount: number, currency: string): number {
    const rate = this.getFXRate(currency);
    return ssAmount * rate;
  }

  async processDeposit(request: DepositRequest): Promise<{
    success: boolean;
    transactionId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    amount: number;
    currency: string;
    fees: number;
    estimatedTime: string;
  }> {
    const gateway = this.getGateway(request.gateway);
    if (!gateway) {
      throw new Error('Invalid payment gateway');
    }

    // Simulate payment processing
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fees = gateway.fees.fixed + (request.amount * gateway.fees.percentage / 100);

    // Simulate different processing outcomes
    const random = Math.random();
    let status: 'pending' | 'processing' | 'completed' | 'failed';
    
    if (random > 0.95) {
      status = 'failed';
    } else if (random > 0.8) {
      status = 'pending';
    } else if (random > 0.3) {
      status = 'processing';
    } else {
      status = 'completed';
    }

    return {
      success: status !== 'failed',
      transactionId,
      status,
      amount: request.amount,
      currency: request.currency,
      fees,
      estimatedTime: gateway.processingTime
    };
  }

  async processConversion(request: ConversionRequest): Promise<{
    success: boolean;
    conversionId: string;
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    rate: number;
  }> {
    const rate = this.getFXRate(request.fromCurrency);
    const ssAmount = this.convertToSmaiSika(request.amount, request.fromCurrency);
    
    const conversionId = `CONV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      conversionId,
      fromAmount: request.amount,
      fromCurrency: request.fromCurrency,
      toAmount: ssAmount,
      toCurrency: 'SS',
      rate
    };
  }
}

export const globalPaymentGateways = new GlobalPaymentGateways();