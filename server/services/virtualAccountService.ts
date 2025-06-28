// Virtual Account Generation Service for Personal Bank Accounts and Crypto Wallets
export interface VirtualBankAccount {
  accountNumber: string;
  bankName: string;
  bankCode: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  accountName: string;
  country: string;
  currency: string;
  provider: string;
}

export interface VirtualCryptoWallet {
  address: string;
  currency: string;
  network: string;
  qrCode?: string;
  provider: string;
}

export interface VirtualAccountProvider {
  id: string;
  name: string;
  type: 'bank' | 'crypto';
  countries: string[];
  currencies: string[];
  apiEndpoint?: string;
  apiKey?: string;
  secretKey?: string;
  isActive: boolean;
}

class VirtualAccountService {
  private bankProviders: VirtualAccountProvider[] = [
    {
      id: 'monnify',
      name: 'Monnify',
      type: 'bank',
      countries: ['NG'],
      currencies: ['NGN'],
      isActive: false
    },
    {
      id: 'paystack',
      name: 'Paystack',
      type: 'bank',
      countries: ['NG', 'ZA', 'GH', 'KE'],
      currencies: ['NGN', 'ZAR', 'GHS', 'KES'],
      isActive: false
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'bank',
      countries: ['NG', 'GH', 'KE', 'ZA', 'UG', 'RW'],
      currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'RWF'],
      isActive: false
    },
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'bank',
      countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
      currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR'],
      isActive: false
    },
    {
      id: 'wise',
      name: 'Wise (formerly TransferWise)',
      type: 'bank',
      countries: ['US', 'GB', 'EU', 'CA', 'AU', 'SG', 'JP'],
      currencies: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'JPY'],
      isActive: false
    }
  ];

  private cryptoProviders: VirtualAccountProvider[] = [
    {
      id: 'coinbase',
      name: 'Coinbase Commerce',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['BTC', 'ETH', 'USDT', 'USDC'],
      isActive: false
    },
    {
      id: 'binance',
      name: 'Binance Pay',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['BTC', 'ETH', 'USDT', 'USDC', 'BNB'],
      isActive: false
    },
    {
      id: 'blockchain_info',
      name: 'Blockchain.info',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['BTC', 'ETH'],
      isActive: false
    },
    {
      id: 'tronlink',
      name: 'TronLink',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['USDT', 'TRX'],
      isActive: false
    }
  ];

  // Get all providers
  getAllProviders(): VirtualAccountProvider[] {
    return [...this.bankProviders, ...this.cryptoProviders];
  }

  // Get providers by country
  getProvidersByCountry(country: string): VirtualAccountProvider[] {
    return this.getAllProviders().filter(provider => 
      provider.countries.includes(country) || provider.countries.includes('GLOBAL')
    );
  }

  // Get providers by type
  getProvidersByType(type: 'bank' | 'crypto'): VirtualAccountProvider[] {
    return type === 'bank' ? this.bankProviders : this.cryptoProviders;
  }

  // Update provider configuration
  updateProvider(providerId: string, config: Partial<VirtualAccountProvider>): boolean {
    const allProviders = [...this.bankProviders, ...this.cryptoProviders];
    const providerIndex = allProviders.findIndex(p => p.id === providerId);
    
    if (providerIndex === -1) return false;

    // Update in the appropriate array
    const isBankProvider = this.bankProviders.findIndex(p => p.id === providerId) !== -1;
    
    if (isBankProvider) {
      const bankIndex = this.bankProviders.findIndex(p => p.id === providerId);
      this.bankProviders[bankIndex] = { ...this.bankProviders[bankIndex], ...config };
    } else {
      const cryptoIndex = this.cryptoProviders.findIndex(p => p.id === providerId);
      this.cryptoProviders[cryptoIndex] = { ...this.cryptoProviders[cryptoIndex], ...config };
    }

    return true;
  }

  // Generate virtual bank account (simulated - will use real APIs when configured)
  async generateVirtualBankAccount(
    userId: string, 
    country: string, 
    currency: string, 
    preferredProvider?: string
  ): Promise<VirtualBankAccount> {
    const availableProviders = this.getProvidersByCountry(country)
      .filter(p => p.type === 'bank' && p.currencies.includes(currency) && p.isActive);

    if (availableProviders.length === 0) {
      throw new Error(`No active bank providers available for ${country}/${currency}`);
    }

    const provider = preferredProvider 
      ? availableProviders.find(p => p.id === preferredProvider) || availableProviders[0]
      : availableProviders[0];

    // Simulate account generation (replace with real API calls)
    return this.simulateVirtualBankAccount(userId, country, currency, provider);
  }

  // Generate virtual crypto wallet (simulated - will use real APIs when configured)
  async generateVirtualCryptoWallet(
    userId: string, 
    currency: string, 
    preferredProvider?: string
  ): Promise<VirtualCryptoWallet> {
    const availableProviders = this.cryptoProviders
      .filter(p => p.currencies.includes(currency) && p.isActive);

    if (availableProviders.length === 0) {
      throw new Error(`No active crypto providers available for ${currency}`);
    }

    const provider = preferredProvider 
      ? availableProviders.find(p => p.id === preferredProvider) || availableProviders[0]
      : availableProviders[0];

    // Simulate wallet generation (replace with real API calls)
    return this.simulateVirtualCryptoWallet(userId, currency, provider);
  }

  // Simulate virtual bank account generation
  private simulateVirtualBankAccount(
    userId: string, 
    country: string, 
    currency: string, 
    provider: VirtualAccountProvider
  ): VirtualBankAccount {
    const timestamp = Date.now();
    const accountSuffix = (timestamp % 100000).toString().padStart(5, '0');
    
    const countryData = {
      'NG': { bankName: 'Providus Bank', bankCode: '101', prefix: '90' },
      'US': { bankName: 'Wells Fargo', bankCode: '121000248', prefix: '55' },
      'GB': { bankName: 'Barclays Bank', bankCode: '20-00-00', prefix: '20' },
      'CA': { bankName: 'Royal Bank of Canada', bankCode: '003', prefix: '10' },
      'AU': { bankName: 'Commonwealth Bank', bankCode: '062', prefix: '06' },
      'DE': { bankName: 'Deutsche Bank', bankCode: '10070000', prefix: '10' },
      'FR': { bankName: 'BNP Paribas', bankCode: '30004', prefix: '30' },
      'ZA': { bankName: 'Standard Bank', bankCode: '051001', prefix: '40' },
      'GH': { bankName: 'Ghana Commercial Bank', bankCode: '030100', prefix: '03' },
      'KE': { bankName: 'Kenya Commercial Bank', bankCode: '01', prefix: '01' }
    };

    const countryInfo = countryData[country as keyof typeof countryData] || countryData['NG'];
    
    return {
      accountNumber: `${countryInfo.prefix}${accountSuffix}${userId.slice(-3)}`,
      bankName: countryInfo.bankName,
      bankCode: countryInfo.bankCode,
      routingNumber: country === 'US' ? countryInfo.bankCode : undefined,
      iban: ['GB', 'DE', 'FR'].includes(country) ? `${country}29 NWBK 6016 1331 9268 19` : undefined,
      swiftCode: `${country}BKXXX`,
      accountName: `SmaiSika User ${userId.slice(-6).toUpperCase()}`,
      country,
      currency,
      provider: provider.name
    };
  }

  // Simulate virtual crypto wallet generation
  private simulateVirtualCryptoWallet(
    userId: string, 
    currency: string, 
    provider: VirtualAccountProvider
  ): VirtualCryptoWallet {
    const addressPrefixes = {
      'BTC': '1',
      'ETH': '0x',
      'USDT': '0x',
      'USDC': '0x',
      'TRX': 'T'
    };

    const prefix = addressPrefixes[currency as keyof typeof addressPrefixes] || '0x';
    const addressLength = currency === 'BTC' ? 34 : 42;
    const randomSuffix = Math.random().toString(36).substring(2, addressLength - prefix.length + 2);
    
    return {
      address: `${prefix}${randomSuffix}`,
      currency,
      network: currency === 'TRX' || (currency === 'USDT' && provider.id === 'tronlink') ? 'TRC20' : 
               currency === 'BTC' ? 'Bitcoin' : 'ERC20',
      provider: provider.name
    };
  }
}

export const virtualAccountService = new VirtualAccountService();