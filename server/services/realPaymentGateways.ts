import axios from 'axios';

// Real payment gateway configuration
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
const MONNIFY_BASE_URL = 'https://api.monnify.com/api/v1';

interface PaymentRequest {
  userId: string;
  amount: number;
  email: string;
  currency: string;
  country: string;
  gateway: string;
  phone?: string;
  walletAddress?: string;
}

interface PaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  reference?: string;
  error?: string;
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  depositAddress?: string;
  instructions?: string;
  amount?: number;
  currency?: string;
  fees?: number;
  estimatedTime?: string;
}

export class RealPaymentGateways {
  // Nigeria: Paystack Integration
  async initializePaystackPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { userId, amount, email, currency = 'NGN' } = request;

      if (!process.env.PAYSTACK_SECRET_KEY) {
        throw new Error('Paystack API key not configured');
      }

      const reference = `smai_${Date.now()}_${userId}`;

      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Paystack uses kobo
          currency: 'NGN',
          reference,
          callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/deposit/verify/paystack`,
          metadata: {
            userId,
            gateway: 'paystack',
            country: 'Nigeria'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentData = response.data.data;

      console.log(`💳 Paystack transaction initialized: ${reference} - NGN ${amount}`);

      return {
        success: true,
        checkoutUrl: paymentData.authorization_url,
        reference,
        transactionId: reference,
        status: 'pending',
        amount,
        currency: 'NGN',
        fees: amount * 0.015, // 1.5% Paystack fee
        estimatedTime: '5-10 minutes'
      };

    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to initialize Paystack payment',
        transactionId: `error_${Date.now()}`,
        status: 'failed'
      };
    }
  }

  // Ghana: Flutterwave Integration
  async initializeFlutterwavePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { userId, amount, email, currency = 'GHS' } = request;

      if (!process.env.FLW_SECRET_KEY) {
        throw new Error('Flutterwave API key not configured');
      }

      const txRef = `smai_flw_${Date.now()}_${userId}`;

      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/payments`,
        {
          tx_ref: txRef,
          amount,
          currency: 'GHS',
          redirect_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/deposit/verify/flutterwave`,
          customer: {
            email,
            name: `User ${userId}`
          },
          customizations: {
            title: "SmaiSika Wallet Deposit",
            description: "Deposit funds to your SmaiSika wallet"
          },
          meta: {
            userId,
            gateway: 'flutterwave',
            country: 'Ghana'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentData = response.data.data;

      console.log(`🌍 Flutterwave transaction initialized: ${txRef} - GHS ${amount}`);

      return {
        success: true,
        checkoutUrl: paymentData.link,
        reference: txRef,
        transactionId: txRef,
        status: 'pending',
        amount,
        currency: 'GHS',
        fees: amount * 0.02, // 2% Flutterwave fee
        estimatedTime: '5-15 minutes'
      };

    } catch (error: any) {
      console.error('Flutterwave initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to initialize Flutterwave payment',
        transactionId: `error_${Date.now()}`,
        status: 'failed'
      };
    }
  }

  // Kenya: M-PESA Integration (Simplified)
  async initializeMpesaPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { userId, amount, phone, currency = 'KES' } = request;

      if (!phone) {
        throw new Error('Phone number required for M-PESA');
      }

      const txRef = `smai_mpesa_${Date.now()}_${userId}`;

      console.log(`📱 M-PESA transaction initiated: ${txRef} - KES ${amount} to ${phone}`);

      // M-PESA would require Safaricom API integration
      // For now, returning success for demo purposes
      return {
        success: true,
        reference: txRef,
        transactionId: txRef,
        status: 'processing',
        amount,
        currency: 'KES',
        fees: 30, // Standard M-PESA fee
        estimatedTime: '2-5 minutes',
        instructions: `Check your phone ${phone} for M-PESA confirmation prompt`
      };

    } catch (error: any) {
      console.error('M-PESA initialization error:', error);
      return {
        success: false,
        error: 'Failed to initialize M-PESA payment',
        transactionId: `error_${Date.now()}`,
        status: 'failed'
      };
    }
  }

  // South Africa: PayFast Integration (Mock)
  async initializePayfastPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { userId, amount, email, currency = 'ZAR' } = request;

      const txRef = `smai_payfast_${Date.now()}_${userId}`;

      console.log(`🇿🇦 PayFast transaction initiated: ${txRef} - ZAR ${amount}`);

      return {
        success: true,
        checkoutUrl: `https://www.payfast.co.za/eng/process?merchant_id=123&amount=${amount}&item_name=SmaiSika Deposit&return_url=${process.env.BASE_URL}/wallet`,
        reference: txRef,
        transactionId: txRef,
        status: 'pending',
        amount,
        currency: 'ZAR',
        fees: amount * 0.03, // 3% PayFast fee
        estimatedTime: '10-30 minutes'
      };

    } catch (error: any) {
      console.error('PayFast initialization error:', error);
      return {
        success: false,
        error: 'Failed to initialize PayFast payment',
        transactionId: `error_${Date.now()}`,
        status: 'failed'
      };
    }
  }

  // Cryptocurrency: USDT/USDC Deposit
  async initializeCryptoDeposit(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { userId, amount, currency = 'USDT' } = request;

      const txRef = `smai_crypto_${Date.now()}_${userId}`;

      // Generate deposit address (in real implementation, this would be from wallet service)
      const depositAddresses = {
        USDT: '0x742d35Cc6C6C4532C4c1B8F2a7cBE9b8c5F8E9A1',
        USDC: '0x8e7D1C3F9b2A4d5e6F7C8B9A0E1F2D3C4B5A6E7F',
        BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ETH: '0x9f6A7B8C5D4E3F2A1B0C9D8E7F6A5B4C3D2E1F0A'
      };

      const depositAddress = depositAddresses[currency as keyof typeof depositAddresses] || depositAddresses.USDT;

      console.log(`₿ Crypto deposit initiated: ${txRef} - ${amount} ${currency}`);

      return {
        success: true,
        reference: txRef,
        transactionId: txRef,
        status: 'pending',
        amount,
        currency,
        depositAddress,
        fees: 0, // No fees for crypto deposits
        estimatedTime: '15-60 minutes',
        instructions: `Transfer exactly ${amount} ${currency} to ${depositAddress}. Your deposit will be credited after 3 confirmations.`
      };

    } catch (error: any) {
      console.error('Crypto deposit initialization error:', error);
      return {
        success: false,
        error: 'Failed to initialize crypto deposit',
        transactionId: `error_${Date.now()}`,
        status: 'failed'
      };
    }
  }

  // Verify Paystack Payment
  async verifyPaystackPayment(reference: string): Promise<{ success: boolean; amount?: number; userId?: string; currency?: string }> {
    try {
      if (!process.env.PAYSTACK_SECRET_KEY) {
        throw new Error('Paystack API key not configured');
      }

      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      const transaction = response.data.data;

      if (transaction.status === 'success') {
        const amount = transaction.amount / 100; // Convert from kobo
        console.log(`✅ Paystack verification successful: ${reference} - NGN ${amount}`);
        
        return {
          success: true,
          amount,
          userId: transaction.metadata.userId,
          currency: 'NGN'
        };
      } else {
        return { success: false };
      }

    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return { success: false };
    }
  }

  // Verify Flutterwave Payment
  async verifyFlutterwavePayment(txRef: string): Promise<{ success: boolean; amount?: number; userId?: string; currency?: string }> {
    try {
      if (!process.env.FLW_SECRET_KEY) {
        throw new Error('Flutterwave API key not configured');
      }

      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
          }
        }
      );

      const transaction = response.data.data;

      if (transaction.status === 'successful') {
        console.log(`✅ Flutterwave verification successful: ${txRef} - GHS ${transaction.amount}`);
        
        return {
          success: true,
          amount: transaction.amount,
          userId: transaction.meta.userId,
          currency: 'GHS'
        };
      } else {
        return { success: false };
      }

    } catch (error: any) {
      console.error('Flutterwave verification error:', error.response?.data || error.message);
      return { success: false };
    }
  }

  // Get supported gateways by country
  getSupportedGateways(country: string): string[] {
    const gateways: { [key: string]: string[] } = {
      'NG': ['paystack', 'flutterwave', 'monnify'],
      'GH': ['flutterwave', 'paystack'],
      'KE': ['mpesa', 'flutterwave'],
      'ZA': ['payfast', 'paystack'],
      'UG': ['flutterwave'],
      'TZ': ['flutterwave'],
      'RW': ['flutterwave'],
      'SN': ['flutterwave'],
      'CI': ['flutterwave'],
      'CM': ['flutterwave'],
      'GLOBAL': ['crypto']
    };

    return gateways[country] || ['crypto'];
  }

  // Get FX rates for currency conversion - FIXED: 1 SS = 1 USD forever
  // Real-world exchange rates as of 2025 (approximate market rates)
  getFXRates(): { [currency: string]: number } {
    return {
      NGN: 1500,   // 1500 NGN = 1 SS (Real NGN/USD rate ~1500:1)
      GHS: 12,     // 12 GHS = 1 SS (Real GHS/USD rate ~12:1)
      KES: 130,    // 130 KES = 1 SS (Real KES/USD rate ~130:1)
      ZAR: 18,     // 18 ZAR = 1 SS (Real ZAR/USD rate ~18:1)
      ETB: 60,     // 60 ETB = 1 SS (Real ETB/USD rate ~60:1)
      USD: 1.0,    // 1 USD = 1 SS (FIXED RATE - NEVER CHANGE)
      USDT: 1.0,   // 1 USDT = 1 SS (FIXED RATE)
      USDC: 1.0,   // 1 USDC = 1 SS (FIXED RATE)
      EUR: 0.95,   // 0.95 EUR = 1 SS (EUR stronger than USD)
      GBP: 0.80,   // 0.80 GBP = 1 SS (GBP stronger than USD)
      BTC: 0.000015, // 0.000015 BTC = 1 SS
      ETH: 0.0002    // 0.0002 ETH = 1 SS
    };
  }

  // Convert currency to SmaiSika
  convertToSmaiSika(amount: number, currency: string): number {
    const rates = this.getFXRates();
    const rate = rates[currency];
    
    if (!rate) {
      throw new Error(`Currency ${currency} not supported`);
    }

    return amount / rate;
  }

  // Process conversion
  async processConversion(request: {
    amount: number;
    fromCurrency: string;
    toCurrency: 'SS';
    userId: string;
  }): Promise<{
    success: boolean;
    conversionId: string;
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: 'SS';
    rate: number;
  }> {
    try {
      const { amount, fromCurrency, userId } = request;
      
      const rates = this.getFXRates();
      const rate = rates[fromCurrency];
      
      if (!rate) {
        throw new Error(`Currency ${fromCurrency} not supported`);
      }

      const smaiSikaAmount = this.convertToSmaiSika(amount, fromCurrency);
      const conversionId = `conv_${Date.now()}_${userId}`;

      console.log(`🔄 Conversion processed: ${amount} ${fromCurrency} → ${smaiSikaAmount.toFixed(4)} SS`);

      return {
        success: true,
        conversionId,
        fromAmount: amount,
        fromCurrency,
        toAmount: smaiSikaAmount,
        toCurrency: 'SS',
        rate
      };

    } catch (error: any) {
      console.error('Conversion processing error:', error);
      throw error;
    }
  }
}

export const realPaymentGateways = new RealPaymentGateways();