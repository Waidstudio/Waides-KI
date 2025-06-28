import { storage } from '../storage';

export interface ConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  userId?: string;
}

export interface ConversionResult {
  success: boolean;
  fromAmount: number;
  toAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  fees: number;
  netAmount: number;
  transactionId: string;
  timestamp: string;
  message?: string;
}

export interface SmaiSikaConversion {
  success: boolean;
  convertedAmount: number;
  localCurrency: string;
  exchangeRate: number;
  fees: number;
  netAmount: number;
  transactionId: string;
  instructions: string;
}

export class CurrencyConversionService {
  // Fixed exchange rate: 1 SS = 1 USD forever
  private readonly SS_TO_USD_RATE = 1.0;
  
  // Exchange rates from USD to local currencies (simulated real-time rates)
  private readonly USD_EXCHANGE_RATES: Record<string, number> = {
    NGN: 1650.00,  // Nigerian Naira
    KES: 129.50,   // Kenyan Shilling
    ZAR: 18.75,    // South African Rand
    GHS: 15.20,    // Ghanaian Cedi
    EGP: 49.15,    // Egyptian Pound
    TZS: 2500.00,  // Tanzanian Shilling
    UGX: 3750.00,  // Ugandan Shilling
    RWF: 1350.00,  // Rwandan Franc
    ETB: 125.50,   // Ethiopian Birr
    MAD: 10.15,    // Moroccan Dirham
    XOF: 620.00,   // West African CFA Franc
    XAF: 620.00,   // Central African CFA Franc
    USD: 1.00,     // US Dollar (base)
    EUR: 0.92,     // Euro
    GBP: 0.79,     // British Pound
    CAD: 1.36,     // Canadian Dollar
    AUD: 1.52,     // Australian Dollar
    JPY: 150.25,   // Japanese Yen
    CNY: 7.25,     // Chinese Yuan
    INR: 83.50,    // Indian Rupee
    BRL: 5.15,     // Brazilian Real
  };

  private readonly CONVERSION_FEE_RATE = 0.025; // 2.5% conversion fee

  async convertCurrency(request: ConversionRequest): Promise<ConversionResult> {
    try {
      const { fromCurrency, toCurrency, amount, userId } = request;
      
      // Get exchange rates
      const fromRate = this.getExchangeRate(fromCurrency);
      const toRate = this.getExchangeRate(toCurrency);
      
      if (!fromRate || !toRate) {
        throw new Error(`Unsupported currency pair: ${fromCurrency}/${toCurrency}`);
      }

      // Convert to USD first, then to target currency
      const usdAmount = fromCurrency === 'SS' ? amount * this.SS_TO_USD_RATE : amount / fromRate;
      const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * toRate;
      
      // Calculate fees
      const fees = convertedAmount * this.CONVERSION_FEE_RATE;
      const netAmount = convertedAmount - fees;
      
      // Generate transaction ID
      const transactionId = this.generateTransactionId();
      
      // Record conversion in database if user provided
      if (userId) {
        await this.recordConversion({
          userId,
          transactionId,
          fromCurrency,
          toCurrency,
          fromAmount: amount,
          toAmount: netAmount,
          exchangeRate: convertedAmount / amount,
          fees,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        fromAmount: amount,
        toAmount: convertedAmount,
        fromCurrency,
        toCurrency,
        exchangeRate: convertedAmount / amount,
        fees,
        netAmount,
        transactionId,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      return {
        success: false,
        fromAmount: request.amount,
        toAmount: 0,
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        exchangeRate: 0,
        fees: 0,
        netAmount: 0,
        transactionId: '',
        timestamp: new Date().toISOString(),
        message: error.message
      };
    }
  }

  async convertSmaiSikaToLocal(ssAmount: number, targetCurrency: string, userId?: string): Promise<SmaiSikaConversion> {
    try {
      // Convert SS to USD first (1:1 rate)
      const usdAmount = ssAmount * this.SS_TO_USD_RATE;
      
      // Get target currency rate
      const targetRate = this.USD_EXCHANGE_RATES[targetCurrency];
      if (!targetRate) {
        throw new Error(`Unsupported target currency: ${targetCurrency}`);
      }

      // Convert USD to target currency
      const convertedAmount = usdAmount * targetRate;
      
      // Calculate fees (2.5% of converted amount)
      const fees = convertedAmount * this.CONVERSION_FEE_RATE;
      const netAmount = convertedAmount - fees;
      
      // Generate transaction ID
      const transactionId = this.generateTransactionId();
      
      // Record conversion
      if (userId) {
        await this.recordConversion({
          userId,
          transactionId,
          fromCurrency: 'SS',
          toCurrency: targetCurrency,
          fromAmount: ssAmount,
          toAmount: netAmount,
          exchangeRate: targetRate,
          fees,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        convertedAmount,
        localCurrency: targetCurrency,
        exchangeRate: targetRate,
        fees,
        netAmount,
        transactionId,
        instructions: this.getWithdrawalInstructions(targetCurrency, netAmount)
      };

    } catch (error: any) {
      throw new Error(`SmaiSika conversion failed: ${error.message}`);
    }
  }

  private getExchangeRate(currency: string): number | null {
    if (currency === 'SS') return this.SS_TO_USD_RATE;
    return this.USD_EXCHANGE_RATES[currency] || null;
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  private async recordConversion(conversion: any): Promise<void> {
    try {
      // Store conversion record in database
      const conversionRecord = {
        id: conversion.transactionId,
        userId: conversion.userId,
        type: 'conversion',
        amount: conversion.toAmount,
        currency: conversion.toCurrency,
        fromAmount: conversion.fromAmount,
        fromCurrency: conversion.fromCurrency,
        exchangeRate: conversion.exchangeRate,
        fees: conversion.fees,
        status: 'completed',
        timestamp: conversion.timestamp,
        description: `Converted ${conversion.fromAmount} ${conversion.fromCurrency} to ${conversion.toAmount} ${conversion.toCurrency}`
      };
      
      // Add to wallet transactions
      await storage.addWalletTransaction(conversionRecord);
    } catch (error) {
      console.error('Failed to record conversion:', error);
    }
  }

  private getWithdrawalInstructions(currency: string, amount: number): string {
    const instructions: Record<string, string> = {
      NGN: `Your ${amount.toFixed(2)} NGN will be transferred to your Nigerian bank account within 2-4 hours. Please ensure your bank details are correct.`,
      KES: `Your ${amount.toFixed(2)} KES will be sent via M-Pesa or bank transfer within 1-3 hours.`,
      ZAR: `Your ${amount.toFixed(2)} ZAR will be transferred to your South African bank account within 2-6 hours.`,
      GHS: `Your ${amount.toFixed(2)} GHS will be sent via Mobile Money or bank transfer within 1-4 hours.`,
      USD: `Your $${amount.toFixed(2)} USD will be transferred to your designated account within 1-2 business days.`,
      EUR: `Your €${amount.toFixed(2)} EUR will be transferred via SEPA within 1-2 business days.`,
      GBP: `Your £${amount.toFixed(2)} GBP will be transferred via Faster Payments within 2-4 hours.`
    };

    return instructions[currency] || `Your ${amount.toFixed(2)} ${currency} will be processed within 1-5 business days.`;
  }

  // Get available currencies for conversion
  getAvailableCurrencies(): Array<{code: string, name: string, symbol: string}> {
    return [
      { code: 'SS', name: 'SmaiSika', symbol: 'ꠄ' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
      { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
      { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
      { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
      { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
      { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
      { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
      { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
      { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
      { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
      { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
    ];
  }

  // Get real-time exchange rates
  getExchangeRates(): Record<string, number> {
    return {
      SS: this.SS_TO_USD_RATE,
      ...this.USD_EXCHANGE_RATES
    };
  }
}

export const currencyConversionService = new CurrencyConversionService();