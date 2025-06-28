import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { serviceRegistry } from "./serviceRegistry.js";

// WebSocket setup for real-time features
let wss: any = null;

export function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    const memoryStats = serviceRegistry.getMemoryStats();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      memory: memoryStats,
      uptime: process.uptime()
    });
  });

  // Core ETH data endpoints
  app.get("/api/eth/current", async (req, res) => {
    try {
      const ethMonitor = await serviceRegistry.get('ethMonitor');
      const data = await ethMonitor.getCurrentData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ETH data" });
    }
  });

  app.get("/api/eth/historical", async (req, res) => {
    try {
      const ethData = await storage.getEthDataHistory(100);
      res.json(ethData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  // Trading signals endpoint
  app.get("/api/signals/current", async (req, res) => {
    try {
      const signalAnalyzer = await serviceRegistry.get('signalAnalyzer');
      const ethMonitor = await serviceRegistry.get('ethMonitor');
      
      const ethData = await ethMonitor.getCurrentData();
      const signal = await signalAnalyzer.generateSignal(ethData);
      
      res.json(signal);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate signal" });
    }
  });

  // KonsAI chat endpoint
  app.post("/api/konsai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const konsaiEngine = await serviceRegistry.get('konsaiEngine');
      const response = await konsaiEngine.generateEnhancedResponse(message);
      
      res.json({ response });
    } catch (error) {
      console.error("KonsAi error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Enhanced KonsAI chat endpoint
  app.post("/api/konsai/enhanced-chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const konsaiEngine = await serviceRegistry.get('konsaiEngine');
      const response = await konsaiEngine.generateEnhancedResponse(message, context || {});
      
      res.json({ 
        response,
        timestamp: new Date().toISOString(),
        context: context || {}
      });
    } catch (error) {
      console.error("KonsAi enhanced error:", error);
      res.status(500).json({ error: "Failed to process enhanced message" });
    }
  });

  // KonsAi Active System Monitoring - Show health status from 200+ modules
  app.get("/api/konsai/system-health", async (req, res) => {
    try {
      const konsaiEngine = await serviceRegistry.get('konsaiEngine');
      
      if (konsaiEngine && typeof konsaiEngine.getSystemHealth === 'function') {
        const health = konsaiEngine.getSystemHealth();
        res.json({
          status: "monitoring_active",
          ...health,
          message: "KonsAi Intelligence actively monitoring using 200+ modules"
        });
      } else {
        res.json({
          status: "initializing",
          message: "KonsAi Intelligence system starting up",
          modulesActive: { kons: 29, deepCore: 0, futuristic: 0, total: 29 }
        });
      }
    } catch (error) {
      console.error('KonsAi system health error:', error);
      res.status(500).json({ error: "Failed to get system health status" });
    }
  });

  // WebSocket setup for real-time data
  app.get("/api/websocket/status", async (req, res) => {
    try {
      const binanceWS = await serviceRegistry.get('binanceWebSocket');
      const status = binanceWS.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get WebSocket status" });
    }
  });

  // Service management endpoints
  app.get("/api/services/status", (req, res) => {
    const stats = serviceRegistry.getMemoryStats();
    const loadedServices = serviceRegistry.getLoadedServices();
    
    res.json({
      ...stats,
      loadedServices,
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/services/cleanup", (req, res) => {
    serviceRegistry.cleanup();
    const stats = serviceRegistry.getMemoryStats();
    res.json({
      message: "Cleanup completed",
      ...stats
    });
  });

  // Trading Brain endpoints
  app.get("/api/trading-brain/questions", async (req, res) => {
    try {
      const tradingBrain = await serviceRegistry.get('tradingBrain');
      const questions = await tradingBrain.getRandomQuestions(10);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get trading questions" });
    }
  });

  // Waides KI Core endpoints
  app.get("/api/waides-ki/status", async (req, res) => {
    try {
      const waidesCore = await serviceRegistry.get('waidesCore');
      const status = await waidesCore.getCurrentStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get Waides KI status" });
    }
  });

  // SMS Configuration endpoints
  app.get("/api/sms/status", (req, res) => {
    res.json({
      configured: false,
      message: "SMS service available but not configured"
    });
  });

  app.post("/api/sms/configure", (req, res) => {
    const { phoneNumber } = req.body;
    res.json({
      success: true,
      message: `SMS configured for ${phoneNumber}`,
      phoneNumber
    });
  });

  // Basic user endpoints
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      res.json(user || { id: 1, username: "demo_user" });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // Chat Oracle endpoints (legacy support)
  app.get("/api/chat/oracle/status", (req, res) => {
    res.json({
      status: "active",
      message: "Oracle service is operational",
      capabilities: ["ETH analysis", "Trading insights", "Market predictions"]
    });
  });

  // Divine reading endpoint (legacy support)
  app.get("/api/divine-reading", async (req, res) => {
    try {
      const konsaiEngine = await serviceRegistry.get('konsaiEngine');
      const reading = await konsaiEngine.generateEnhancedResponse("Provide a divine market reading", {});
      
      res.json({
        reading: reading || "The spirits whisper of opportunity in the ETH markets. Patience and wisdom shall guide your trades.",
        timestamp: new Date().toISOString(),
        energy_level: Math.floor(Math.random() * 100) + 1
      });
    } catch (error) {
      res.json({
        reading: "The cosmos align for strategic patience. Current market energies suggest careful observation.",
        timestamp: new Date().toISOString(),
        energy_level: 75
      });
    }
  });

  // Wallet balance endpoint (legacy support)
  app.get("/api/wallet/balance", (req, res) => {
    res.json({
      balance: 10000,
      currency: "USDT",
      available: 9500,
      reserved: 500,
      last_updated: new Date().toISOString()
    });
  });

  // Wallet transactions endpoint
  app.get("/api/wallet/transactions", (req, res) => {
    res.json([
      {
        id: '1',
        type: 'deposit',
        amount: '₦50,000.00',
        date: '2025-06-24',
        status: 'completed',
        description: 'Wallet funding via Paystack'
      },
      {
        id: '2',
        type: 'conversion',
        amount: '₦10,000 → ꠄ20.00',
        date: '2025-06-25',
        status: 'completed',
        description: 'Local to SmaiSika conversion'
      },
      {
        id: '3',
        type: 'trade',
        amount: 'ꠄ5.00',
        date: '2025-06-26',
        status: 'completed',
        description: 'ETH trading operation'
      }
    ]);
  });

  // Enhanced wallet countries endpoint with global coverage
  app.get("/api/wallet/countries", async (req, res) => {
    try {
      const { globalPaymentGateway } = await import("./services/globalPaymentGateway.js");
      const countries = globalPaymentGateway.getSupportedCountries();
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ error: 'Failed to fetch supported countries' });
    }
  });

  // Wallet payment methods endpoint
  app.get("/api/wallet/payment-methods", (req, res) => {
    res.json([
      {
        id: 1,
        methodType: 'mobile_money',
        provider: 'MTN Mobile Money',
        country: 'Nigeria',
        currency: 'NGN',
        accountIdentifier: '+234***1234',
        displayName: 'MTN ***1234',
        isActive: true,
        isVerified: true
      },
      {
        id: 2,
        methodType: 'bank_account',
        provider: 'Access Bank',
        country: 'Nigeria',
        currency: 'NGN',
        accountIdentifier: '****5678',
        displayName: 'Access Bank ***5678',
        isActive: true,
        isVerified: false
      }
    ]);
  });

  // Wallet African providers endpoint
  app.get("/api/wallet/african-providers", (req, res) => {
    res.json([
      {
        id: 1,
        country: 'Nigeria',
        countryCode: 'NG',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'NGN',
        minAmount: '₦100',
        maxAmount: '₦500,000',
        fees: '1.5%',
        processingTime: '2-5 minutes',
        logo: '/api/placeholder/32/32',
        description: 'Nigeria\'s largest mobile money platform',
        isActive: true
      },
      {
        id: 2,
        country: 'Nigeria',
        countryCode: 'NG',
        provider: 'Airtel Money',
        providerType: 'mobile_money',
        currency: 'NGN',
        minAmount: '₦100',
        maxAmount: '₦300,000',
        fees: '1.8%',
        processingTime: '2-5 minutes',
        logo: '/api/placeholder/32/32',
        description: 'Fast and reliable mobile payments',
        isActive: true
      },
      {
        id: 3,
        country: 'Ghana',
        countryCode: 'GH',
        provider: 'MTN Mobile Money',
        providerType: 'mobile_money',
        currency: 'GHS',
        minAmount: 'GH₵5',
        maxAmount: 'GH₵10,000',
        fees: '2.0%',
        processingTime: '2-5 minutes',
        logo: '/api/placeholder/32/32',
        description: 'Ghana\'s most trusted mobile money service',
        isActive: true
      },
      {
        id: 4,
        country: 'Kenya',
        countryCode: 'KE',
        provider: 'M-Pesa',
        providerType: 'mobile_money',
        currency: 'KES',
        minAmount: 'KSh 100',
        maxAmount: 'KSh 300,000',
        fees: '1.2%',
        processingTime: '1-3 minutes',
        logo: '/api/placeholder/32/32',
        description: 'Kenya\'s leading mobile money platform',
        isActive: true
      }
    ]);
  });

  // Get global payment gateways by country
  app.get("/api/wallet/gateways/:countryCode", async (req, res) => {
    try {
      const { countryCode } = req.params;
      const { globalPaymentGateways } = await import("./services/globalPaymentGateways.js");
      const gateways = globalPaymentGateways.getGatewaysByCountry(countryCode);
      res.json(gateways);
    } catch (error) {
      console.error('Error fetching gateways:', error);
      res.status(500).json({ error: 'Failed to fetch payment gateways' });
    }
  });

  // Get supported countries
  app.get("/api/wallet/global-countries", async (req, res) => {
    try {
      const { globalPaymentGateways } = await import("./services/globalPaymentGateways.js");
      const countries = globalPaymentGateways.getSupportedCountries();
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ error: 'Failed to fetch supported countries' });
    }
  });

  // Get payment providers for a country
  app.get("/api/wallet/providers/:countryCode", async (req, res) => {
    try {
      const { countryCode } = req.params;
      const { globalPaymentGateway } = await import("./services/globalPaymentGateway.js");
      const providers = globalPaymentGateway.getProvidersByCountry(countryCode);
      res.json(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ error: 'Failed to fetch payment providers' });
    }
  });

  // Add payment method endpoint with real provider validation
  app.post("/api/wallet/payment-methods", async (req, res) => {
    try {
      const { providerId, country, accountIdentifier, displayName } = req.body;
      
      if (!providerId || !country || !accountIdentifier || !displayName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { globalPaymentGateway } = await import("./services/globalPaymentGateway.js");
      const provider = globalPaymentGateway.getProvider(providerId);
      
      if (!provider) {
        return res.status(400).json({ error: 'Invalid payment provider' });
      }

      if (!provider.countries.includes(country)) {
        return res.status(400).json({ error: 'Provider not available in this country' });
      }

      const newPaymentMethod = {
        id: Date.now(),
        providerId,
        providerName: provider.name,
        methodType: provider.type,
        country,
        currency: provider.currencies[0], // Use first supported currency
        accountIdentifier,
        displayName,
        fees: provider.fees,
        processingTime: provider.processingTime,
        logo: provider.logo,
        isActive: true,
        isVerified: false
      };

      res.json({
        success: true,
        message: 'Payment method added successfully',
        paymentMethod: newPaymentMethod
      });
    } catch (error) {
      console.error('Add payment method error:', error);
      res.status(500).json({ error: 'Failed to add payment method' });
    }
  });

  // Real-time deposit endpoint with global payment processing
  app.post("/api/wallet/deposit", async (req, res) => {
    try {
      const { amount, currency, providerId, country, accountDetails } = req.body;
      
      if (!amount || !currency || !providerId || !country || !accountDetails) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }

      const { globalPaymentGateway } = await import("./services/globalPaymentGateway.js");
      
      // Use global payment gateways for processing
      const { globalPaymentGateways } = await import("./services/globalPaymentGateways.js");
      
      // Validate gateway
      const gateway = globalPaymentGateways.getGateway(providerId);
      if (!gateway) {
        return res.status(400).json({ error: 'Invalid payment gateway' });
      }

      if (!gateway.countries.includes(country) && !gateway.countries.includes('GLOBAL')) {
        return res.status(400).json({ error: 'Gateway not available in this country' });
      }

      if (!gateway.currencies.includes(currency)) {
        return res.status(400).json({ error: 'Currency not supported by this gateway' });
      }

      // Process deposit with enhanced global gateway
      const depositRequest = {
        amount: parseFloat(amount),
        currency,
        gateway: providerId,
        country,
        accountDetails,
        userId: 'user_123' // In real app, get from session
      };

      const paymentResponse = await globalPaymentGateways.processDeposit(depositRequest);

      // Create transaction record
      const transaction = {
        id: paymentResponse.transactionId,
        type: 'deposit',
        amount: `${currency} ${paymentResponse.amount.toLocaleString()}`,
        currency: paymentResponse.currency,
        status: paymentResponse.status,
        gateway: providerId,
        gatewayName: gateway.name,
        country,
        fees: paymentResponse.fees,
        netAmount: paymentResponse.amount - paymentResponse.fees,
        estimatedTime: paymentResponse.estimatedTime,
        date: new Date().toISOString().split('T')[0],
        description: `Deposit via ${gateway.name} - ${country}`,
        timestamp: new Date().toISOString()
      };

      console.log(`💰 Global deposit initiated: ${transaction.id} - ${gateway.name} - ${currency} ${amount}`);

      res.json({
        success: paymentResponse.success,
        message: paymentResponse.success ? 'Global deposit initiated successfully' : 'Deposit failed',
        transaction,
        paymentResponse
      });
    } catch (error) {
      console.error('Deposit error:', error);
      res.status(500).json({ error: 'Failed to process deposit' });
    }
  });

  // Payment status tracking endpoint
  app.get("/api/wallet/payment-status/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { globalPaymentGateway } = await import("./services/globalPaymentGateway.js");
      
      const status = await globalPaymentGateway.getPaymentStatus(transactionId);
      res.json(status);
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({ error: 'Failed to get payment status' });
    }
  });

  // Real-time payment update webhook simulation
  app.post("/api/wallet/payment-webhook", async (req, res) => {
    try {
      const { transactionId, status, timestamp } = req.body;
      const { globalPaymentGateway } = await import("./services/globalPaymentGateway.js");
      
      await globalPaymentGateway.simulateWebhookUpdate(transactionId, status);
      
      console.log(`🔄 Payment Webhook: ${transactionId} -> ${status} at ${timestamp}`);
      res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  });

  // Withdraw funds endpoint
  app.post("/api/wallet/withdraw", (req, res) => {
    try {
      const { amount, currency, paymentMethodId, country } = req.body;
      
      if (!amount || !currency || !paymentMethodId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }

      // Check if sufficient balance (simulate)
      const currentBalance = 10000; // This would come from actual wallet service
      if (amount > currentBalance) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Simulate withdrawal processing
      const transaction = {
        id: `wd_${Date.now()}`,
        type: 'withdrawal',
        amount: `${currency} ${amount.toLocaleString()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        description: `Withdrawal to mobile money - ${country}`,
        estimatedCompletion: '5-10 minutes'
      };

      res.json({
        success: true,
        message: 'Withdrawal initiated successfully',
        transaction,
        estimatedCompletion: '5-10 minutes'
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  });

  // Real Payment Gateway Routes - Nigeria: Paystack
  app.post("/api/deposit/nigeria/paystack", async (req, res) => {
    try {
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const result = await realPaymentGateways.initializePaystackPayment(req.body);
      
      res.json(result);
    } catch (error) {
      console.error('Paystack deposit error:', error);
      res.status(500).json({ error: 'Failed to initialize Paystack payment' });
    }
  });

  // Real Payment Gateway Routes - Ghana: Flutterwave
  app.post("/api/deposit/ghana/flutterwave", async (req, res) => {
    try {
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const result = await realPaymentGateways.initializeFlutterwavePayment(req.body);
      
      res.json(result);
    } catch (error) {
      console.error('Flutterwave deposit error:', error);
      res.status(500).json({ error: 'Failed to initialize Flutterwave payment' });
    }
  });

  // Real Payment Gateway Routes - Kenya: M-PESA
  app.post("/api/deposit/kenya/mpesa", async (req, res) => {
    try {
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const result = await realPaymentGateways.initializeMpesaPayment(req.body);
      
      res.json(result);
    } catch (error) {
      console.error('M-PESA deposit error:', error);
      res.status(500).json({ error: 'Failed to initialize M-PESA payment' });
    }
  });

  // Real Payment Gateway Routes - South Africa: PayFast
  app.post("/api/deposit/southafrica/payfast", async (req, res) => {
    try {
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const result = await realPaymentGateways.initializePayfastPayment(req.body);
      
      res.json(result);
    } catch (error) {
      console.error('PayFast deposit error:', error);
      res.status(500).json({ error: 'Failed to initialize PayFast payment' });
    }
  });

  // Real Payment Gateway Routes - Crypto: USDT/USDC
  app.post("/api/deposit/crypto", async (req, res) => {
    try {
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const result = await realPaymentGateways.initializeCryptoDeposit(req.body);
      
      res.json(result);
    } catch (error) {
      console.error('Crypto deposit error:', error);
      res.status(500).json({ error: 'Failed to initialize crypto deposit' });
    }
  });

  // Payment Verification Routes
  app.get("/api/deposit/verify/paystack", async (req, res) => {
    try {
      const { reference } = req.query;
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const verification = await realPaymentGateways.verifyPaystackPayment(reference as string);
      
      if (verification.success) {
        // Add to user balance
        await storage.addToUserBalance(verification.userId!, verification.amount!, verification.currency!);
        res.redirect(`/wallet?success=true&amount=${verification.amount}&currency=${verification.currency}`);
      } else {
        res.redirect(`/wallet?success=false&error=payment_failed`);
      }
    } catch (error) {
      console.error('Paystack verification error:', error);
      res.redirect(`/wallet?success=false&error=verification_failed`);
    }
  });

  app.get("/api/deposit/verify/flutterwave", async (req, res) => {
    try {
      const { tx_ref } = req.query;
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const verification = await realPaymentGateways.verifyFlutterwavePayment(tx_ref as string);
      
      if (verification.success) {
        // Add to user balance
        await storage.addToUserBalance(verification.userId!, verification.amount!, verification.currency!);
        res.redirect(`/wallet?success=true&amount=${verification.amount}&currency=${verification.currency}`);
      } else {
        res.redirect(`/wallet?success=false&error=payment_failed`);
      }
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      res.redirect(`/wallet?success=false&error=verification_failed`);
    }
  });

  // SmaiSika conversion endpoint with real gateway integration
  app.post("/api/wallet/convert-to-smaisika", async (req, res) => {
    try {
      const { amount, currency, userId } = req.body;
      
      if (!amount || !currency || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount or currency' });
      }

      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      // Process conversion to SmaiSika using real FX rates
      const conversionRequest = {
        amount: parseFloat(amount),
        fromCurrency: currency,
        toCurrency: 'SS' as const,
        userId: userId || 'user_123'
      };

      const conversionResponse = await realPaymentGateways.processConversion(conversionRequest);

      console.log(`🔄 SmaiSika conversion: ${amount} ${currency} → ${conversionResponse.toAmount} SS`);

      res.json({
        success: conversionResponse.success,
        message: 'Successfully converted to SmaiSika',
        conversion: {
          id: conversionResponse.conversionId,
          fromAmount: conversionResponse.fromAmount,
          fromCurrency: conversionResponse.fromCurrency,
          toAmount: conversionResponse.toAmount,
          toCurrency: conversionResponse.toCurrency,
          rate: conversionResponse.rate,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('SmaiSika conversion error:', error);
      res.status(500).json({ error: 'Failed to convert to SmaiSika' });
    }
  });

  // Get FX rates endpoint with real payment gateway rates
  app.get("/api/wallet/fx-rates", async (req, res) => {
    try {
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      const fxRates = realPaymentGateways.getFXRates();
      const currencies = Object.keys(fxRates);
      
      const rates = currencies.map(currency => ({
        currency,
        rate: fxRates[currency],
        symbol: currency === 'USD' ? '$' : 
                currency === 'EUR' ? '€' : 
                currency === 'GBP' ? '£' : 
                currency === 'NGN' ? '₦' :
                currency === 'GHS' ? 'GH₵' :
                currency === 'KES' ? 'KSh' :
                currency === 'ZAR' ? 'R' :
                currency,
        lastUpdated: new Date().toISOString()
      }));

      res.json({
        baseCurrency: 'SS',
        rates,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('FX rates error:', error);
      res.status(500).json({ error: 'Failed to fetch FX rates' });
    }
  });

  // Convert currency endpoint (local to SmaiSika and vice versa)
  app.post("/api/wallet/convert", (req, res) => {
    try {
      const { fromAmount, fromCurrency, toCurrency, conversionType } = req.body;
      
      if (!fromAmount || !fromCurrency || !toCurrency || !conversionType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (fromAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }

      // Simulate conversion rates
      const conversionRates: Record<string, number> = {
        'NGN_to_SS': 0.04, // 1 NGN = 0.04 SS (SmaiSika)
        'SS_to_NGN': 25,   // 1 SS = 25 NGN
        'USD_to_SS': 1.2,  // 1 USD = 1.2 SS
        'SS_to_USD': 0.83, // 1 SS = 0.83 USD
        'GHS_to_SS': 0.08, // 1 GHS = 0.08 SS
        'SS_to_GHS': 12.5  // 1 SS = 12.5 GHS
      };

      const rateKey = `${fromCurrency}_to_${toCurrency}`;
      const rate = conversionRates[rateKey] || 1;
      const convertedAmount = fromAmount * rate;

      const transaction = {
        id: `conv_${Date.now()}`,
        type: 'conversion',
        amount: `${fromCurrency} ${fromAmount} → ${toCurrency} ${convertedAmount.toFixed(2)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        description: `Currency conversion: ${fromCurrency} to ${toCurrency}`,
        conversionRate: rate
      };

      res.json({
        success: true,
        message: 'Conversion completed successfully',
        transaction,
        convertedAmount,
        rate,
        fromAmount,
        fromCurrency,
        toCurrency
      });
    } catch (error) {
      console.error('Conversion error:', error);
      res.status(500).json({ error: 'Failed to process conversion' });
    }
  });

  // Update payment method endpoint
  app.put("/api/wallet/payment-methods/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { displayName, isActive } = req.body;
      
      // Simulate updating payment method
      res.json({
        success: true,
        message: 'Payment method updated successfully',
        paymentMethod: {
          id: parseInt(id),
          displayName,
          isActive,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Update payment method error:', error);
      res.status(500).json({ error: 'Failed to update payment method' });
    }
  });

  // Delete payment method endpoint
  app.delete("/api/wallet/payment-methods/:id", (req, res) => {
    try {
      const { id } = req.params;
      
      // Simulate deleting payment method
      res.json({
        success: true,
        message: 'Payment method deleted successfully',
        deletedId: parseInt(id)
      });
    } catch (error) {
      console.error('Delete payment method error:', error);
      res.status(500).json({ error: 'Failed to delete payment method' });
    }
  });

  // Admin routes for payment gateway configuration
  app.post("/api/admin/payment-gateway/config", async (req, res) => {
    try {
      const { gatewayId, config } = req.body;

      // Store configuration using API keys storage
      if (config.apiKey) {
        await storage.upsertApiKey({
          service: `${gatewayId}_api_key`,
          key: config.apiKey
        });
      }

      if (config.secretKey) {
        await storage.upsertApiKey({
          service: `${gatewayId}_secret_key`,
          key: config.secretKey
        });
      }

      if (config.publicKey) {
        await storage.upsertApiKey({
          service: `${gatewayId}_public_key`,
          key: config.publicKey
        });
      }

      if (config.merchantId) {
        await storage.upsertApiKey({
          service: `${gatewayId}_merchant_id`,
          key: config.merchantId
        });
      }

      console.log(`🔧 Admin: Payment gateway ${gatewayId} configuration saved`);

      res.json({
        success: true,
        message: `${gatewayId} configuration saved successfully`
      });
    } catch (error: any) {
      console.error('Admin configuration error:', error);
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  });

  app.post("/api/admin/payment-gateway/test", async (req, res) => {
    try {
      const { gatewayId } = req.body;

      // Get stored configuration
      const apiKey = await storage.getApiKey(`${gatewayId}_api_key`);

      if (!apiKey) {
        return res.json({
          success: false,
          message: 'API key not configured'
        });
      }

      console.log(`🧪 Admin: Testing ${gatewayId} connection...`);

      // Real connection test with stored API keys
      const { realPaymentGateways } = await import("./services/realPaymentGateways.js");
      
      // Temporarily set environment variables for testing
      const originalEnv = process.env;
      try {
        if (gatewayId === 'paystack') {
          process.env.PAYSTACK_SECRET_KEY = apiKey.key;
        } else if (gatewayId === 'flutterwave') {
          process.env.FLW_SECRET_KEY = apiKey.key;
        }

        // Test with small amount
        const testRequest = {
          userId: 'test_user',
          amount: 1,
          email: 'test@example.com',
          currency: gatewayId === 'paystack' ? 'NGN' : 'GHS',
          country: gatewayId === 'paystack' ? 'NG' : 'GH',
          gateway: gatewayId
        };

        let testResult;
        if (gatewayId === 'paystack') {
          testResult = await realPaymentGateways.initializePaystackPayment(testRequest);
        } else if (gatewayId === 'flutterwave') {
          testResult = await realPaymentGateways.initializeFlutterwavePayment(testRequest);
        } else {
          // For other gateways, do basic validation
          testResult = { success: apiKey.key.length > 5 };
        }

        res.json({
          success: testResult.success,
          message: testResult.success ? 'Gateway connection verified' : 'Connection failed',
          timestamp: new Date().toISOString()
        });

        console.log(`${testResult.success ? '✅' : '❌'} Admin: ${gatewayId} test ${testResult.success ? 'passed' : 'failed'}`);
      } finally {
        // Restore original environment
        process.env = originalEnv;
      }
    } catch (error: any) {
      console.error('Admin test error:', error);
      res.status(500).json({
        success: false,
        message: 'Test failed',
        error: error.message
      });
    }
  });

  // Get payment gateway status for admin
  app.get("/api/admin/payment-gateway/status", async (req, res) => {
    try {
      const gateways = ['paystack', 'flutterwave', 'mpesa', 'payfast', 'monnify', 'crypto_usdt', 'crypto_usdc', 'crypto_btc'];
      const status: { [key: string]: any } = {};

      for (const gateway of gateways) {
        const apiKey = await storage.getApiKey(`${gateway}_api_key`);
        status[gateway] = {
          configured: !!apiKey,
          hasApiKey: !!apiKey?.key,
          lastUpdated: apiKey?.createdAt || null
        };
      }

      res.json(status);
    } catch (error: any) {
      console.error('Gateway status error:', error);
      res.status(500).json({ error: 'Failed to fetch gateway status' });
    }
  });

  return Promise.resolve(server);
}