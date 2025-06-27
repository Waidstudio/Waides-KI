import { db } from '../db';
import { 
  africanPaymentProviders, 
  exchangeRates, 
  walletTransactions, 
  paymentMethods,
  type AfricanPaymentProvider,
  type InsertAfricanPaymentProvider,
  type ExchangeRate,
  type InsertExchangeRate,
  type WalletTransaction,
  type InsertWalletTransaction,
  type PaymentMethod,
  type InsertPaymentMethod
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class AfricanPaymentService {
  constructor() {
    this.initializeProviders();
  }

  // Initialize African payment providers data
  private async initializeProviders() {
    try {
      const existingProviders = await db.select().from(africanPaymentProviders).limit(1);
      if (existingProviders.length === 0) {
        await this.seedAfricanProviders();
      }
    } catch (error) {
      console.log('Payment providers already initialized or error:', error);
    }
  }

  // Seed comprehensive African payment providers
  private async seedAfricanProviders() {
    const providers: InsertAfricanPaymentProvider[] = [
      // Kenya
      {
        country: 'Kenya',
        countryCode: 'KE',
        provider: 'M-Pesa',
        providerType: 'mobile_money',
        currency: 'KES',
        minAmount: '10.00',
        maxAmount: '300000.00',
        fees: '0.015',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇰🇪',
        description: 'Leading mobile money service in Kenya'
      },
      {
        country: 'Kenya',
        countryCode: 'KE',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'KES',
        minAmount: '10.00',
        maxAmount: '150000.00',
        fees: '0.020',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇰🇪',
        description: 'Fast mobile payments across Kenya'
      },

      // Nigeria
      {
        country: 'Nigeria',
        countryCode: 'NG',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'NGN',
        minAmount: '100.00',
        maxAmount: '2000000.00',
        fees: '0.025',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇳🇬',
        description: 'MTN Mobile Money Nigeria'
      },
      {
        country: 'Nigeria',
        countryCode: 'NG',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'NGN',
        minAmount: '100.00',
        maxAmount: '1500000.00',
        fees: '0.030',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇳🇬',
        description: 'Airtel Money Nigeria'
      },
      {
        country: 'Nigeria',
        countryCode: 'NG',
        provider: 'OPay',
        providerType: 'fintech',
        currency: 'NGN',
        minAmount: '50.00',
        maxAmount: '5000000.00',
        fees: '0.012',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: true,
        logo: '🇳🇬',
        description: 'Leading fintech payment platform'
      },

      // Ghana
      {
        country: 'Ghana',
        countryCode: 'GH',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'GHS',
        minAmount: '5.00',
        maxAmount: '100000.00',
        fees: '0.018',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇬🇭',
        description: 'MTN MoMo Ghana'
      },
      {
        country: 'Ghana',
        countryCode: 'GH',
        provider: 'AirtelTigo Money',
        providerType: 'mobile_money',
        currency: 'GHS',
        minAmount: '5.00',
        maxAmount: '50000.00',
        fees: '0.022',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇬🇭',
        description: 'AirtelTigo Mobile Money'
      },
      {
        country: 'Ghana',
        countryCode: 'GH',
        provider: 'Vodafone Cash',
        providerType: 'mobile_money',
        currency: 'GHS',
        minAmount: '5.00',
        maxAmount: '75000.00',
        fees: '0.020',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇬🇭',
        description: 'Vodafone Mobile Money'
      },

      // South Africa
      {
        country: 'South Africa',
        countryCode: 'ZA',
        provider: 'Vodacom M-Pesa',
        providerType: 'mobile_money',
        currency: 'ZAR',
        minAmount: '10.00',
        maxAmount: '100000.00',
        fees: '0.025',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇿🇦',
        description: 'Vodacom M-Pesa South Africa'
      },
      {
        country: 'South Africa',
        countryCode: 'ZA',
        provider: 'MTN Money',
        providerType: 'mobile_money',
        currency: 'ZAR',
        minAmount: '10.00',
        maxAmount: '75000.00',
        fees: '0.030',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇿🇦',
        description: 'MTN Mobile Money'
      },

      // Uganda
      {
        country: 'Uganda',
        countryCode: 'UG',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'UGX',
        minAmount: '1000.00',
        maxAmount: '20000000.00',
        fees: '0.015',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇺🇬',
        description: 'MTN Mobile Money Uganda'
      },
      {
        country: 'Uganda',
        countryCode: 'UG',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'UGX',
        minAmount: '1000.00',
        maxAmount: '15000000.00',
        fees: '0.020',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇺🇬',
        description: 'Airtel Money Uganda'
      },

      // Tanzania
      {
        country: 'Tanzania',
        countryCode: 'TZ',
        provider: 'M-Pesa',
        providerType: 'mobile_money',
        currency: 'TZS',
        minAmount: '1000.00',
        maxAmount: '10000000.00',
        fees: '0.018',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇹🇿',
        description: 'Vodacom M-Pesa Tanzania'
      },
      {
        country: 'Tanzania',
        countryCode: 'TZ',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'TZS',
        minAmount: '1000.00',
        maxAmount: '8000000.00',
        fees: '0.022',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇹🇿',
        description: 'Airtel Money Tanzania'
      },

      // Rwanda
      {
        country: 'Rwanda',
        countryCode: 'RW',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'RWF',
        minAmount: '100.00',
        maxAmount: '2000000.00',
        fees: '0.015',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇷🇼',
        description: 'MTN MoMo Rwanda'
      },
      {
        country: 'Rwanda',
        countryCode: 'RW',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'RWF',
        minAmount: '100.00',
        maxAmount: '1500000.00',
        fees: '0.020',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇷🇼',
        description: 'Airtel Money Rwanda'
      },

      // Zambia
      {
        country: 'Zambia',
        countryCode: 'ZM',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'ZMW',
        minAmount: '5.00',
        maxAmount: '50000.00',
        fees: '0.025',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇿🇲',
        description: 'MTN Mobile Money Zambia'
      },
      {
        country: 'Zambia',
        countryCode: 'ZM',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'ZMW',
        minAmount: '5.00',
        maxAmount: '40000.00',
        fees: '0.030',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇿🇲',
        description: 'Airtel Money Zambia'
      },

      // Botswana
      {
        country: 'Botswana',
        countryCode: 'BW',
        provider: 'Orange Money',
        providerType: 'mobile_money',
        currency: 'BWP',
        minAmount: '5.00',
        maxAmount: '25000.00',
        fees: '0.020',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇧🇼',
        description: 'Orange Money Botswana'
      },
      {
        country: 'Botswana',
        countryCode: 'BW',
        provider: 'Mascom MyZaka',
        providerType: 'mobile_money',
        currency: 'BWP',
        minAmount: '5.00',
        maxAmount: '20000.00',
        fees: '0.025',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇧🇼',
        description: 'Mascom Mobile Money'
      },

      // Malawi
      {
        country: 'Malawi',
        countryCode: 'MW',
        provider: 'TNM Mpamba',
        providerType: 'mobile_money',
        currency: 'MWK',
        minAmount: '100.00',
        maxAmount: '500000.00',
        fees: '0.020',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇲🇼',
        description: 'TNM Mpamba Mobile Money'
      },
      {
        country: 'Malawi',
        countryCode: 'MW',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'MWK',
        minAmount: '100.00',
        maxAmount: '400000.00',
        fees: '0.025',
        processingTime: 'instant',
        supportedOperations: ['deposit', 'withdrawal'],
        requiresKYC: false,
        logo: '🇲🇼',
        description: 'Airtel Money Malawi'
      }
    ];

    await db.insert(africanPaymentProviders).values(providers);
    console.log('✅ African payment providers initialized successfully');
  }

  // Get all African payment providers
  async getAfricanProviders(): Promise<AfricanPaymentProvider[]> {
    return await db.select().from(africanPaymentProviders).where(eq(africanPaymentProviders.isActive, true));
  }

  // Get providers by country
  async getProvidersByCountry(countryCode: string): Promise<AfricanPaymentProvider[]> {
    return await db.select()
      .from(africanPaymentProviders)
      .where(and(
        eq(africanPaymentProviders.countryCode, countryCode),
        eq(africanPaymentProviders.isActive, true)
      ));
  }

  // Get provider by name and country
  async getProvider(provider: string, countryCode: string): Promise<AfricanPaymentProvider | null> {
    const providers = await db.select()
      .from(africanPaymentProviders)
      .where(and(
        eq(africanPaymentProviders.provider, provider),
        eq(africanPaymentProviders.countryCode, countryCode),
        eq(africanPaymentProviders.isActive, true)
      ));
    
    return providers[0] || null;
  }

  // Add user payment method
  async addPaymentMethod(userId: number, methodData: InsertPaymentMethod): Promise<PaymentMethod> {
    const [method] = await db.insert(paymentMethods).values(methodData).returning();
    return method;
  }

  // Get user payment methods
  async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return await db.select()
      .from(paymentMethods)
      .where(and(
        eq(paymentMethods.userId, userId),
        eq(paymentMethods.isActive, true)
      ));
  }

  // Process deposit transaction
  async processDeposit(
    userId: number, 
    walletId: number, 
    amount: string, 
    currency: string, 
    localAmount: string, 
    localCurrency: string, 
    paymentMethodId: number,
    exchangeRate: string
  ): Promise<WalletTransaction> {
    const transactionData: InsertWalletTransaction = {
      userId,
      walletId,
      transactionType: 'deposit',
      amount,
      currency,
      localAmount,
      localCurrency,
      exchangeRate,
      paymentMethodId,
      status: 'processing',
      description: `Deposit via ${localCurrency} mobile money`,
      fees: '0.00'
    };

    const [transaction] = await db.insert(walletTransactions).values(transactionData).returning();
    
    // Simulate processing (in real implementation, this would call actual payment APIs)
    setTimeout(async () => {
      await this.completeTransaction(transaction.id, 'completed');
    }, 2000);

    return transaction;
  }

  // Process withdrawal transaction
  async processWithdrawal(
    userId: number, 
    walletId: number, 
    amount: string, 
    currency: string, 
    localAmount: string, 
    localCurrency: string, 
    paymentMethodId: number,
    exchangeRate: string
  ): Promise<WalletTransaction> {
    const transactionData: InsertWalletTransaction = {
      userId,
      walletId,
      transactionType: 'withdrawal',
      amount,
      currency,
      localAmount,
      localCurrency,
      exchangeRate,
      paymentMethodId,
      status: 'processing',
      description: `Withdrawal to ${localCurrency} mobile money`,
      fees: '0.00'
    };

    const [transaction] = await db.insert(walletTransactions).values(transactionData).returning();
    
    // Simulate processing (in real implementation, this would call actual payment APIs)
    setTimeout(async () => {
      await this.completeTransaction(transaction.id, 'completed');
    }, 3000);

    return transaction;
  }

  // Complete transaction
  async completeTransaction(transactionId: number, status: 'completed' | 'failed'): Promise<void> {
    await db.update(walletTransactions)
      .set({ 
        status, 
        processedAt: new Date(),
        ...(status === 'failed' && { failureReason: 'Payment provider error' })
      })
      .where(eq(walletTransactions.id, transactionId));
  }

  // Get user transactions
  async getUserTransactions(userId: number, limit: number = 50): Promise<WalletTransaction[]> {
    return await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .limit(limit);
  }

  // Get exchange rate
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Mock exchange rates - in production, fetch from real API
    const mockRates: Record<string, number> = {
      'KES_USD': 0.0067,
      'NGN_USD': 0.0007,
      'GHS_USD': 0.082,
      'ZAR_USD': 0.055,
      'UGX_USD': 0.00027,
      'TZS_USD': 0.00043,
      'RWF_USD': 0.00082,
      'ZMW_USD': 0.062,
      'BWP_USD': 0.075,
      'MWK_USD': 0.00098,
      'USD_KES': 149.5,
      'USD_NGN': 1420.0,
      'USD_GHS': 12.2,
      'USD_ZAR': 18.1,
      'USD_UGX': 3700.0,
      'USD_TZS': 2340.0,
      'USD_RWF': 1220.0,
      'USD_ZMW': 16.1,
      'USD_BWP': 13.3,
      'USD_MWK': 1020.0
    };

    const rateKey = `${fromCurrency}_${toCurrency}`;
    return mockRates[rateKey] || 1.0;
  }

  // Get supported countries
  async getSupportedCountries(): Promise<{ code: string; name: string; currency: string; providers: number }[]> {
    const providers = await this.getAfricanProviders();
    const countryMap = new Map();

    providers.forEach(provider => {
      const key = provider.countryCode;
      if (!countryMap.has(key)) {
        countryMap.set(key, {
          code: provider.countryCode,
          name: provider.country,
          currency: provider.currency,
          providers: 0
        });
      }
      countryMap.get(key).providers++;
    });

    return Array.from(countryMap.values());
  }
}

export const africanPaymentService = new AfricanPaymentService();