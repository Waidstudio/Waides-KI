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
    // Nigeria
    {
      id: 'monnify',
      name: 'Monnify',
      type: 'bank',
      countries: ['NG'],
      currencies: ['NGN'],
      isActive: true
    },
    {
      id: 'paystack',
      name: 'Paystack',
      type: 'bank',
      countries: ['NG', 'ZA', 'GH', 'KE'],
      currencies: ['NGN', 'ZAR', 'GHS', 'KES'],
      isActive: true
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'bank',
      countries: ['NG', 'GH', 'KE', 'ZA', 'UG', 'RW', 'TZ', 'ZM'],
      currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'RWF', 'TZS', 'ZMW'],
      isActive: true
    },
    // Kenya
    {
      id: 'mpesa',
      name: 'M-Pesa',
      type: 'bank',
      countries: ['KE', 'TZ', 'UG'],
      currencies: ['KES', 'TZS', 'UGX'],
      isActive: true
    },
    // South Africa
    {
      id: 'payfast',
      name: 'PayFast',
      type: 'bank',
      countries: ['ZA'],
      currencies: ['ZAR'],
      isActive: true
    },
    // Morocco
    {
      id: 'cmi',
      name: 'CMI Morocco',
      type: 'bank',
      countries: ['MA'],
      currencies: ['MAD'],
      isActive: true
    },
    // Egypt
    {
      id: 'fawry',
      name: 'Fawry',
      type: 'bank',
      countries: ['EG'],
      currencies: ['EGP'],
      isActive: true
    },
    // Ethiopia
    {
      id: 'hellocash',
      name: 'HelloCash',
      type: 'bank',
      countries: ['ET'],
      currencies: ['ETB'],
      isActive: true
    },
    // Tunisia
    {
      id: 'tunisie_telecom',
      name: 'Tunisie Telecom Mobile Payment',
      type: 'bank',
      countries: ['TN'],
      currencies: ['TND'],
      isActive: true
    },
    // Senegal
    {
      id: 'orange_money_senegal',
      name: 'Orange Money Senegal',
      type: 'bank',
      countries: ['SN'],
      currencies: ['XOF'],
      isActive: true
    },
    // Ivory Coast
    {
      id: 'orange_money_ci',
      name: 'Orange Money Côte d\'Ivoire',
      type: 'bank',
      countries: ['CI'],
      currencies: ['XOF'],
      isActive: true
    },
    // Cameroon
    {
      id: 'mtn_mobile_money_cm',
      name: 'MTN Mobile Money Cameroon',
      type: 'bank',
      countries: ['CM'],
      currencies: ['XAF'],
      isActive: true
    },
    // Botswana
    {
      id: 'myZaka',
      name: 'myZaka',
      type: 'bank',
      countries: ['BW'],
      currencies: ['BWP'],
      isActive: true
    },
    // Mozambique
    {
      id: 'mpesa_mz',
      name: 'M-Pesa Mozambique',
      type: 'bank',
      countries: ['MZ'],
      currencies: ['MZN'],
      isActive: true
    },
    // Global providers
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'bank',
      countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'SG', 'JP'],
      currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR', 'SGD', 'JPY'],
      isActive: true
    },
    {
      id: 'wise',
      name: 'Wise (formerly TransferWise)',
      type: 'bank',
      countries: ['US', 'GB', 'EU', 'CA', 'AU', 'SG', 'JP'],
      currencies: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'JPY'],
      isActive: true
    }
  ];

  private cryptoProviders: VirtualAccountProvider[] = [
    {
      id: 'coinbase',
      name: 'Coinbase Commerce',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['BTC', 'ETH', 'USDT', 'USDC'],
      isActive: true
    },
    {
      id: 'binance',
      name: 'Binance Pay',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['BTC', 'ETH', 'USDT', 'USDC', 'BNB'],
      isActive: true
    },
    {
      id: 'blockchain_info',
      name: 'Blockchain.info',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['BTC', 'ETH'],
      isActive: true
    },
    {
      id: 'tronlink',
      name: 'TronLink',
      type: 'crypto',
      countries: ['GLOBAL'],
      currencies: ['USDT', 'TRX'],
      isActive: true
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
      // African Countries - Major
      'NG': { bankName: 'Providus Bank', bankCode: '101', prefix: '90' },
      'ZA': { bankName: 'Standard Bank', bankCode: '051001', prefix: '40' },
      'GH': { bankName: 'Ghana Commercial Bank', bankCode: '030100', prefix: '03' },
      'KE': { bankName: 'Kenya Commercial Bank', bankCode: '01', prefix: '01' },
      'UG': { bankName: 'Stanbic Bank Uganda', bankCode: '031', prefix: '20' },
      'TZ': { bankName: 'CRDB Bank', bankCode: '01', prefix: '61' },
      'RW': { bankName: 'Bank of Kigali', bankCode: '002', prefix: '40' },
      'ZM': { bankName: 'Zanaco Bank', bankCode: '010', prefix: '10' },
      'MA': { bankName: 'Attijariwafa Bank', bankCode: '007', prefix: '20' },
      'EG': { bankName: 'National Bank of Egypt', bankCode: '002', prefix: '01' },
      'ET': { bankName: 'Commercial Bank of Ethiopia', bankCode: '001', prefix: '10' },
      'TN': { bankName: 'Banque Centrale de Tunisie', bankCode: '001', prefix: '08' },
      'SN': { bankName: 'Banque Atlantique Sénégal', bankCode: '001', prefix: '52' },
      'CI': { bankName: 'Société Générale Côte d\'Ivoire', bankCode: '001', prefix: '05' },
      'CM': { bankName: 'Afriland First Bank', bankCode: '001', prefix: '73' },
      'BW': { bankName: 'First National Bank Botswana', bankCode: '001', prefix: '62' },
      'MZ': { bankName: 'Standard Bank Mozambique', bankCode: '001', prefix: '25' },
      'AO': { bankName: 'Banco de Fomento Angola', bankCode: '010', prefix: '24' },
      'MW': { bankName: 'National Bank of Malawi', bankCode: '001', prefix: '26' },
      'ZW': { bankName: 'Central Bank of Zimbabwe', bankCode: '001', prefix: '26' },
      'BF': { bankName: 'Ecobank Burkina Faso', bankCode: '001', prefix: '22' },
      'ML': { bankName: 'Banque Malienne de Solidarité', bankCode: '001', prefix: '22' },
      'NE': { bankName: 'Banque Islamique du Niger', bankCode: '001', prefix: '22' },
      'TD': { bankName: 'Commercial Bank Tchad', bankCode: '001', prefix: '23' },
      'CF': { bankName: 'Banque Populaire Maroco-Centrafricaine', bankCode: '001', prefix: '23' },
      'CG': { bankName: 'Banque Congolaise de l\'Habitat', bankCode: '001', prefix: '24' },
      'GA': { bankName: 'Banque Gabonaise de Développement', bankCode: '001', prefix: '24' },
      'GQ': { bankName: 'Banque des États de l\'Afrique Centrale', bankCode: '001', prefix: '24' },
      'ST': { bankName: 'Banco Internacional de São Tomé', bankCode: '001', prefix: '23' },
      // North Africa
      'LY': { bankName: 'Central Bank of Libya', bankCode: '001', prefix: '21' },
      'DZ': { bankName: 'Banque d\'Algérie', bankCode: '001', prefix: '21' },
      'SD': { bankName: 'Bank of Sudan', bankCode: '001', prefix: '24' },
      'SS': { bankName: 'Bank of South Sudan', bankCode: '001', prefix: '21' },
      // East Africa
      'SO': { bankName: 'Central Bank of Somalia', bankCode: '001', prefix: '25' },
      'DJ': { bankName: 'Banque Centrale de Djibouti', bankCode: '001', prefix: '25' },
      'ER': { bankName: 'Bank of Eritrea', bankCode: '001', prefix: '29' },
      // West Africa
      'LR': { bankName: 'Central Bank of Liberia', bankCode: '001', prefix: '23' },
      'SL': { bankName: 'Bank of Sierra Leone', bankCode: '001', prefix: '23' },
      'GN': { bankName: 'Banque Centrale de Guinée', bankCode: '001', prefix: '22' },
      'GW': { bankName: 'Banco da Guiné-Bissau', bankCode: '001', prefix: '24' },
      'GM': { bankName: 'Central Bank of The Gambia', bankCode: '001', prefix: '22' },
      'CV': { bankName: 'Banco de Cabo Verde', bankCode: '001', prefix: '23' },
      // Southern Africa
      'NA': { bankName: 'Bank of Namibia', bankCode: '001', prefix: '26' },
      'SZ': { bankName: 'Central Bank of Eswatini', bankCode: '001', prefix: '26' },
      'LS': { bankName: 'Central Bank of Lesotho', bankCode: '001', prefix: '26' },
      // Island Nations
      'MU': { bankName: 'Bank of Mauritius', bankCode: '001', prefix: '23' },
      'SC': { bankName: 'Central Bank of Seychelles', bankCode: '001', prefix: '24' },
      'KM': { bankName: 'Banque Centrale des Comores', bankCode: '001', prefix: '26' },
      'MG': { bankName: 'Banque Centrale de Madagascar', bankCode: '001', prefix: '26' },
      // Global Countries
      'US': { bankName: 'Wells Fargo', bankCode: '121000248', prefix: '55' },
      'GB': { bankName: 'Barclays Bank', bankCode: '20-00-00', prefix: '20' },
      'CA': { bankName: 'Royal Bank of Canada', bankCode: '003', prefix: '10' },
      'AU': { bankName: 'Commonwealth Bank', bankCode: '062', prefix: '06' },
      'DE': { bankName: 'Deutsche Bank', bankCode: '10070000', prefix: '10' },
      'FR': { bankName: 'BNP Paribas', bankCode: '30004', prefix: '30' },
      'SG': { bankName: 'DBS Bank', bankCode: '7171', prefix: '71' },
      'JP': { bankName: 'Sumitomo Mitsui Banking', bankCode: '0009', prefix: '00' }
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