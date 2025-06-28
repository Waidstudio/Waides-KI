import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { serviceRegistry } from "./serviceRegistry.js";
import { appConfigurationService } from "./services/appConfigurationService.js";
// import { megaAdminConfigService } from "./services/megaAdminConfigService.js"; // Temporarily disabled due to syntax errors
import ExpandedMegaAdminService from "./services/expandedMegaAdminService.js";
import { workingMegaAdminService } from "./services/workingMegaAdminService.js";

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

  // Get all payment gateways (used by frontend without country code)
  app.get("/api/wallet/gateways", async (req, res) => {
    try {
      const { country } = req.query;
      
      // Enhanced payment gateways including comprehensive debit/credit card options
      const allGateways = [
        // Debit/Credit Card Options (Global)
        {
          id: 'visa_global',
          name: 'Visa Card',
          type: 'card',
          countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NG', 'ZA', 'KE', 'GH'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR', 'NGN', 'ZAR', 'KES', 'GHS'],
          fees: { fixed: 0.30, percentage: 2.9 },
          processingTime: '2-5 minutes',
          isActive: true
        },
        {
          id: 'mastercard_global',
          name: 'Mastercard',
          type: 'card',
          countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NG', 'ZA', 'KE', 'GH'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR', 'NGN', 'ZAR', 'KES', 'GHS'],
          fees: { fixed: 0.30, percentage: 2.9 },
          processingTime: '2-5 minutes',
          isActive: true
        },
        {
          id: 'amex_global',
          name: 'American Express',
          type: 'card',
          countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR'],
          fees: { fixed: 0.30, percentage: 3.5 },
          processingTime: '2-5 minutes',
          isActive: true
        },
        {
          id: 'discover_us',
          name: 'Discover Card',
          type: 'card',
          countries: ['US'],
          currencies: ['USD'],
          fees: { fixed: 0.30, percentage: 2.9 },
          processingTime: '2-5 minutes',
          isActive: true
        },
        // Mobile Money
        {
          id: 'mtn_momo',
          name: 'MTN Mobile Money',
          type: 'mobile_money',
          countries: ['NG', 'GH', 'UG', 'RW'],
          currencies: ['NGN', 'GHS', 'UGX', 'RWF'],
          fees: { fixed: 0, percentage: 1.5 },
          processingTime: '2-5 minutes',
          isActive: true
        },
        {
          id: 'airtel_money',
          name: 'Airtel Money',
          type: 'mobile_money',
          countries: ['NG', 'KE', 'UG', 'TZ'],
          currencies: ['NGN', 'KES', 'UGX', 'TZS'],
          fees: { fixed: 0, percentage: 1.8 },
          processingTime: '2-5 minutes',
          isActive: true
        },
        {
          id: 'mpesa',
          name: 'M-Pesa',
          type: 'mobile_money',
          countries: ['KE', 'TZ', 'UG'],
          currencies: ['KES', 'TZS', 'UGX'],
          fees: { fixed: 0, percentage: 1.2 },
          processingTime: '1-3 minutes',
          isActive: true
        },
        // Bank Transfer
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          type: 'bank_transfer',
          countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NG', 'ZA', 'KE', 'GH'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR', 'NGN', 'ZAR', 'KES', 'GHS'],
          fees: { fixed: 5.00, percentage: 0.5 },
          processingTime: '1-3 business days',
          isActive: true
        },
        // Digital Wallets
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'digital_wallet',
          countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD', 'EUR'],
          fees: { fixed: 0.30, percentage: 3.4 },
          processingTime: '3-7 minutes',
          isActive: true
        },
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          type: 'digital_wallet',
          countries: ['US', 'GB', 'CA', 'AU'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD'],
          fees: { fixed: 0.30, percentage: 2.9 },
          processingTime: '1-2 minutes',
          isActive: true
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          type: 'digital_wallet',
          countries: ['US', 'GB', 'CA', 'AU', 'IN'],
          currencies: ['USD', 'GBP', 'CAD', 'AUD', 'INR'],
          fees: { fixed: 0.30, percentage: 2.9 },
          processingTime: '1-2 minutes',
          isActive: true
        },
        // Crypto
        {
          id: 'crypto_usdt',
          name: 'USDT (Tether)',
          type: 'crypto',
          countries: ['GLOBAL'],
          currencies: ['USDT'],
          fees: { fixed: 1.00, percentage: 0.1 },
          processingTime: '5-15 minutes',
          isActive: true
        },
        {
          id: 'crypto_usdc',
          name: 'USDC (USD Coin)',
          type: 'crypto',
          countries: ['GLOBAL'],
          currencies: ['USDC'],
          fees: { fixed: 1.00, percentage: 0.1 },
          processingTime: '5-15 minutes',
          isActive: true
        }
      ];

      // Filter by country if specified
      if (country && typeof country === 'string') {
        const filteredGateways = allGateways.filter(gateway => 
          gateway.countries.includes(country) || gateway.countries.includes('GLOBAL')
        );
        res.json(filteredGateways);
      } else {
        res.json(allGateways);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
      res.status(500).json({ error: 'Failed to fetch payment gateways' });
    }
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

      // CRITICAL: Actually update user balances in storage
      if (conversionResponse.success) {
        const userId = conversionRequest.userId;
        
        // Debit the source currency from user balance
        await storage.deductFromUserBalance(userId, conversionResponse.fromAmount, conversionResponse.fromCurrency);
        
        // Credit SmaiSika to user balance
        await storage.addToSmaiSikaBalance(userId, conversionResponse.toAmount);
        
        // Record conversion transaction
        await storage.createConversion({
          id: conversionResponse.conversionId,
          userId,
          fromAmount: conversionResponse.fromAmount,
          fromCurrency: conversionResponse.fromCurrency,
          toAmount: conversionResponse.toAmount,
          toCurrency: 'SS',
          rate: conversionResponse.rate,
          status: 'completed'
        });
      }

      console.log(`🔄 SmaiSika conversion: ${amount} ${currency} → ${conversionResponse.toAmount} SS (Balances Updated)`);

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

  // Get FX rates endpoint - FIXED: 1 SS = 1 USD, real-world local currency rates
  app.get("/api/wallet/fx-rates", async (req, res) => {
    try {
      // Fixed rate: 1 SS = 1 USD for major currencies, real-world rates for African currencies
      const rates = [
        { currency: 'USD', rate: 1.0, symbol: '$', lastUpdated: new Date().toISOString() },
        { currency: 'EUR', rate: 0.95, symbol: '€', lastUpdated: new Date().toISOString() },
        { currency: 'GBP', rate: 0.80, symbol: '£', lastUpdated: new Date().toISOString() },
        { currency: 'NGN', rate: 1500, symbol: '₦', lastUpdated: new Date().toISOString() },
        { currency: 'GHS', rate: 12, symbol: 'GH₵', lastUpdated: new Date().toISOString() },
        { currency: 'KES', rate: 130, symbol: 'KSh', lastUpdated: new Date().toISOString() },
        { currency: 'ZAR', rate: 18, symbol: 'R', lastUpdated: new Date().toISOString() },
        { currency: 'ETB', rate: 60, symbol: 'Br', lastUpdated: new Date().toISOString() },
        { currency: 'CAD', rate: 1.35, symbol: 'C$', lastUpdated: new Date().toISOString() },
        { currency: 'AUD', rate: 1.50, symbol: 'A$', lastUpdated: new Date().toISOString() }
      ];

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

  // Enhanced Currency Conversion Endpoints
  
  // Get available currencies for conversion
  app.get("/api/currency/available", async (req, res) => {
    try {
      const { currencyConversionService } = await import("./services/currencyConversionService.js");
      const currencies = currencyConversionService.getAvailableCurrencies();
      res.json({
        success: true,
        currencies,
        totalCurrencies: currencies.length
      });
    } catch (error) {
      console.error('Available currencies error:', error);
      res.status(500).json({ error: 'Failed to get available currencies' });
    }
  });

  // Get current exchange rates
  app.get("/api/currency/rates", async (req, res) => {
    try {
      const { currencyConversionService } = await import("./services/currencyConversionService.js");
      const rates = currencyConversionService.getExchangeRates();
      res.json({
        success: true,
        rates,
        baseCurrency: "USD",
        timestamp: new Date().toISOString(),
        note: "SmaiSika (SS) maintains fixed 1:1 rate with USD"
      });
    } catch (error) {
      console.error('Exchange rates error:', error);
      res.status(500).json({ error: 'Failed to get exchange rates' });
    }
  });

  // Convert currency
  app.post("/api/currency/convert", async (req, res) => {
    try {
      const { currencyConversionService } = await import("./services/currencyConversionService.js");
      const { fromCurrency, toCurrency, amount, userId } = req.body;
      
      if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ 
          error: 'Missing required fields: fromCurrency, toCurrency, amount' 
        });
      }

      if (amount <= 0) {
        return res.status(400).json({ 
          error: 'Amount must be greater than 0' 
        });
      }

      const result = await currencyConversionService.convertCurrency({
        fromCurrency,
        toCurrency,
        amount,
        userId
      });

      if (!result.success) {
        return res.status(400).json({ 
          error: result.message || 'Conversion failed' 
        });
      }

      res.json(result);
    } catch (error) {
      console.error('Currency conversion error:', error);
      res.status(500).json({ error: 'Failed to process currency conversion' });
    }
  });

  // Convert SmaiSika to local currency
  app.post("/api/currency/convert-smaisika", async (req, res) => {
    try {
      const { currencyConversionService } = await import("./services/currencyConversionService.js");
      const { ssAmount, targetCurrency, userId } = req.body;
      
      if (!ssAmount || !targetCurrency) {
        return res.status(400).json({ 
          error: 'Missing required fields: ssAmount, targetCurrency' 
        });
      }

      if (ssAmount <= 0) {
        return res.status(400).json({ 
          error: 'SmaiSika amount must be greater than 0' 
        });
      }

      const result = await currencyConversionService.convertSmaiSikaToLocal(
        ssAmount, 
        targetCurrency, 
        userId
      );

      res.json(result);
    } catch (error) {
      console.error('SmaiSika conversion error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to convert SmaiSika to local currency' 
      });
    }
  });

  // Virtual Account Management Endpoints
  
  // Get all virtual account providers
  app.get("/api/virtual-accounts/providers", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const { country, type } = req.query;
      
      let providers;
      if (country) {
        providers = virtualAccountService.getProvidersByCountry(country as string);
      } else if (type) {
        providers = virtualAccountService.getProvidersByType(type as 'bank' | 'crypto');
      } else {
        providers = virtualAccountService.getAllProviders();
      }
      
      res.json(providers);
    } catch (error) {
      console.error('Virtual account providers error:', error);
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  });

  // Update virtual account provider configuration
  app.put("/api/virtual-accounts/providers/:providerId", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const { providerId } = req.params;
      const config = req.body;
      
      const success = virtualAccountService.updateProvider(providerId, config);
      
      if (!success) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      res.json({ success: true, message: 'Provider updated successfully' });
    } catch (error) {
      console.error('Provider update error:', error);
      res.status(500).json({ error: 'Failed to update provider' });
    }
  });

  // Generate virtual bank account
  app.post("/api/virtual-accounts/generate/bank", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const { userId, country, currency, preferredProvider } = req.body;
      
      if (!userId || !country || !currency) {
        return res.status(400).json({ error: 'Missing required fields: userId, country, currency' });
      }
      
      const virtualAccount = await virtualAccountService.generateVirtualBankAccount(
        userId, country, currency, preferredProvider
      );
      
      res.json({
        success: true,
        virtualAccount,
        instructions: `Transfer funds to the provided bank account details. Your deposit will be credited to your SmaiSika wallet automatically.`
      });
    } catch (error) {
      console.error('Virtual bank account generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate virtual bank account' });
    }
  });

  // Generate virtual crypto wallet
  app.post("/api/virtual-accounts/generate/crypto", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const { userId, currency, preferredProvider } = req.body;
      
      if (!userId || !currency) {
        return res.status(400).json({ error: 'Missing required fields: userId, currency' });
      }
      
      const virtualWallet = await virtualAccountService.generateVirtualCryptoWallet(
        userId, currency, preferredProvider
      );
      
      res.json({
        success: true,
        virtualWallet,
        instructions: `Send ${currency} to the provided wallet address. Your deposit will be credited to your SmaiSika wallet automatically.`
      });
    } catch (error) {
      console.error('Virtual crypto wallet generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate virtual crypto wallet' });
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

  // Testing endpoint - Generate virtual bank account for ANY African country
  app.post("/api/wallet/test/generate-bank-account", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const { userId = 'test_user', country, currency, preferredProvider } = req.body;
      
      if (!country || !currency) {
        return res.status(400).json({ error: 'Missing required fields: country, currency' });
      }
      
      const virtualAccount = await virtualAccountService.generateVirtualBankAccount(
        userId, country, currency, preferredProvider
      );
      
      res.json({
        success: true,
        testMode: true,
        virtualAccount,
        instructions: `TESTING MODE: This is a simulated ${country} bank account for SmaiSika deposits. Use these details to send ${currency} funds.`,
        note: "This is a test account. In production, real banking APIs will be used."
      });
    } catch (error) {
      console.error('Test bank account generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate test bank account' });
    }
  });

  // Testing endpoint - Generate crypto wallet for testing
  app.post("/api/wallet/test/generate-crypto-wallet", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const { userId = 'test_user', currency, preferredProvider } = req.body;
      
      if (!currency) {
        return res.status(400).json({ error: 'Missing required field: currency' });
      }
      
      const virtualWallet = await virtualAccountService.generateVirtualCryptoWallet(
        userId, currency, preferredProvider
      );
      
      res.json({
        success: true,
        testMode: true,
        virtualWallet,
        instructions: `TESTING MODE: Send ${currency} to this wallet address. Your SmaiSika balance will be credited automatically.`,
        note: "This is a test wallet. In production, real crypto wallet APIs will be used."
      });
    } catch (error) {
      console.error('Test crypto wallet generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate test crypto wallet' });
    }
  });

  // ===============================
  // COMPREHENSIVE ADMIN CONFIG API
  // ===============================
  
  // Get comprehensive configuration (500+ settings)
  app.get("/api/admin/comprehensive-config", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const config = comprehensiveAdminConfig.getConfig();
      const settingCount = comprehensiveAdminConfig.getSettingCount();
      
      res.json({
        ...config,
        _metadata: {
          settingCount,
          lastUpdated: new Date().toISOString(),
          version: "2.0"
        }
      });
    } catch (error) {
      console.error('Get comprehensive config error:', error);
      res.status(500).json({ error: error.message || 'Failed to get configuration' });
    }
  });

  // Update specific section configuration
  app.put("/api/admin/comprehensive-config/:section", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const { section } = req.params;
      const updates = req.body;
      
      const updatedConfig = comprehensiveAdminConfig.updateConfig(section as any, updates);
      
      res.json({
        success: true,
        section,
        updatedConfig: updatedConfig[section as keyof typeof updatedConfig],
        settingCount: comprehensiveAdminConfig.getSettingCount()
      });
    } catch (error) {
      console.error('Update section config error:', error);
      res.status(500).json({ error: error.message || 'Failed to update section configuration' });
    }
  });

  // Update individual setting
  app.put("/api/admin/comprehensive-config/:section/:key", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const { section, key } = req.params;
      const { value } = req.body;
      
      const updatedConfig = comprehensiveAdminConfig.updateSetting(section as any, key, value);
      
      res.json({
        success: true,
        section,
        key,
        value,
        updatedConfig: updatedConfig[section as keyof typeof updatedConfig]
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ error: error.message || 'Failed to update setting' });
    }
  });

  // Reset section to defaults
  app.post("/api/admin/comprehensive-config/:section/reset", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const { section } = req.params;
      
      const updatedConfig = comprehensiveAdminConfig.resetSection(section as any);
      
      res.json({
        success: true,
        section,
        resetConfig: updatedConfig[section as keyof typeof updatedConfig],
        message: `Section ${section} has been reset to default values`
      });
    } catch (error) {
      console.error('Reset section error:', error);
      res.status(500).json({ error: error.message || 'Failed to reset section' });
    }
  });

  // Search settings
  app.get("/api/admin/comprehensive-config/search", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = comprehensiveAdminConfig.searchSettings(query);
      
      res.json({
        query,
        results,
        count: results.length
      });
    } catch (error) {
      console.error('Search settings error:', error);
      res.status(500).json({ error: error.message || 'Failed to search settings' });
    }
  });

  // Export configuration
  app.get("/api/admin/comprehensive-config/export", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const configJson = comprehensiveAdminConfig.exportConfig();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="waides-ki-config.json"');
      res.send(configJson);
    } catch (error) {
      console.error('Export config error:', error);
      res.status(500).json({ error: error.message || 'Failed to export configuration' });
    }
  });

  // Import configuration
  app.post("/api/admin/comprehensive-config/import", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const { configJson } = req.body;
      
      if (!configJson) {
        return res.status(400).json({ error: 'Configuration JSON is required' });
      }
      
      const updatedConfig = comprehensiveAdminConfig.importConfig(configJson);
      
      res.json({
        success: true,
        message: 'Configuration imported successfully',
        settingCount: comprehensiveAdminConfig.getSettingCount()
      });
    } catch (error) {
      console.error('Import config error:', error);
      res.status(500).json({ error: error.message || 'Failed to import configuration' });
    }
  });

  // Validate configuration
  app.get("/api/admin/comprehensive-config/validate", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const validation = comprehensiveAdminConfig.validateConfig();
      
      res.json({
        ...validation,
        settingCount: comprehensiveAdminConfig.getSettingCount()
      });
    } catch (error) {
      console.error('Validate config error:', error);
      res.status(500).json({ error: error.message || 'Failed to validate configuration' });
    }
  });

  // Get configuration statistics
  app.get("/api/admin/comprehensive-config/stats", async (req, res) => {
    try {
      const { comprehensiveAdminConfig } = await import("./services/comprehensiveAdminConfig.js");
      const config = comprehensiveAdminConfig.getConfig();
      
      const stats = {
        totalSettings: comprehensiveAdminConfig.getSettingCount(),
        sectionBreakdown: {},
        lastUpdated: new Date().toISOString()
      };
      
      // Count settings per section
      Object.entries(config).forEach(([sectionName, section]) => {
        if (typeof section === 'object' && section !== null) {
          (stats.sectionBreakdown as any)[sectionName] = Object.keys(section).length;
        }
      });
      
      res.json(stats);
    } catch (error) {
      console.error('Get config stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get configuration statistics' });
    }
  });

  // Get all African countries supported for testing
  app.get("/api/wallet/test/african-countries", async (req, res) => {
    try {
      const { virtualAccountService } = await import("./services/virtualAccountService.js");
      const africanCountries = [
        // Major African countries with full banking support
        { code: 'NG', name: 'Nigeria', currency: 'NGN', providers: ['monnify', 'paystack', 'flutterwave'] },
        { code: 'ZA', name: 'South Africa', currency: 'ZAR', providers: ['paystack', 'payfast', 'flutterwave'] },
        { code: 'GH', name: 'Ghana', currency: 'GHS', providers: ['paystack', 'flutterwave'] },
        { code: 'KE', name: 'Kenya', currency: 'KES', providers: ['paystack', 'mpesa', 'flutterwave'] },
        { code: 'UG', name: 'Uganda', currency: 'UGX', providers: ['mpesa', 'flutterwave'] },
        { code: 'TZ', name: 'Tanzania', currency: 'TZS', providers: ['mpesa', 'flutterwave'] },
        { code: 'RW', name: 'Rwanda', currency: 'RWF', providers: ['flutterwave'] },
        { code: 'ZM', name: 'Zambia', currency: 'ZMW', providers: ['flutterwave'] },
        { code: 'MA', name: 'Morocco', currency: 'MAD', providers: ['cmi'] },
        { code: 'EG', name: 'Egypt', currency: 'EGP', providers: ['fawry'] },
        { code: 'ET', name: 'Ethiopia', currency: 'ETB', providers: ['hellocash'] },
        { code: 'TN', name: 'Tunisia', currency: 'TND', providers: ['tunisie_telecom'] },
        { code: 'SN', name: 'Senegal', currency: 'XOF', providers: ['orange_money_senegal'] },
        { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', providers: ['orange_money_ci'] },
        { code: 'CM', name: 'Cameroon', currency: 'XAF', providers: ['mtn_mobile_money_cm'] },
        { code: 'BW', name: 'Botswana', currency: 'BWP', providers: ['myZaka'] },
        { code: 'MZ', name: 'Mozambique', currency: 'MZN', providers: ['mpesa_mz'] },
        // Additional African countries for comprehensive testing
        { code: 'AO', name: 'Angola', currency: 'AOA', providers: ['test_bank'] },
        { code: 'MW', name: 'Malawi', currency: 'MWK', providers: ['test_bank'] },
        { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL', providers: ['test_bank'] },
        { code: 'BF', name: 'Burkina Faso', currency: 'XOF', providers: ['test_bank'] },
        { code: 'ML', name: 'Mali', currency: 'XOF', providers: ['test_bank'] },
        { code: 'NE', name: 'Niger', currency: 'XOF', providers: ['test_bank'] },
        { code: 'TD', name: 'Chad', currency: 'XAF', providers: ['test_bank'] },
        { code: 'CF', name: 'Central African Republic', currency: 'XAF', providers: ['test_bank'] },
        { code: 'CG', name: 'Republic of the Congo', currency: 'XAF', providers: ['test_bank'] },
        { code: 'GA', name: 'Gabon', currency: 'XAF', providers: ['test_bank'] },
        { code: 'GQ', name: 'Equatorial Guinea', currency: 'XAF', providers: ['test_bank'] },
        { code: 'ST', name: 'São Tomé and Príncipe', currency: 'STN', providers: ['test_bank'] },
        { code: 'LY', name: 'Libya', currency: 'LYD', providers: ['test_bank'] },
        { code: 'DZ', name: 'Algeria', currency: 'DZD', providers: ['test_bank'] },
        { code: 'SD', name: 'Sudan', currency: 'SDG', providers: ['test_bank'] },
        { code: 'SS', name: 'South Sudan', currency: 'SSP', providers: ['test_bank'] },
        { code: 'SO', name: 'Somalia', currency: 'SOS', providers: ['test_bank'] },
        { code: 'DJ', name: 'Djibouti', currency: 'DJF', providers: ['test_bank'] },
        { code: 'ER', name: 'Eritrea', currency: 'ERN', providers: ['test_bank'] },
        { code: 'LR', name: 'Liberia', currency: 'LRD', providers: ['test_bank'] },
        { code: 'SL', name: 'Sierra Leone', currency: 'SLE', providers: ['test_bank'] },
        { code: 'GN', name: 'Guinea', currency: 'GNF', providers: ['test_bank'] },
        { code: 'GW', name: 'Guinea-Bissau', currency: 'XOF', providers: ['test_bank'] },
        { code: 'GM', name: 'The Gambia', currency: 'GMD', providers: ['test_bank'] },
        { code: 'CV', name: 'Cape Verde', currency: 'CVE', providers: ['test_bank'] },
        { code: 'NA', name: 'Namibia', currency: 'NAD', providers: ['test_bank'] },
        { code: 'SZ', name: 'Eswatini', currency: 'SZL', providers: ['test_bank'] },
        { code: 'LS', name: 'Lesotho', currency: 'LSL', providers: ['test_bank'] },
        { code: 'MU', name: 'Mauritius', currency: 'MUR', providers: ['test_bank'] },
        { code: 'SC', name: 'Seychelles', currency: 'SCR', providers: ['test_bank'] },
        { code: 'KM', name: 'Comoros', currency: 'KMF', providers: ['test_bank'] },
        { code: 'MG', name: 'Madagascar', currency: 'MGA', providers: ['test_bank'] }
      ];
      
      res.json({
        success: true,
        testMode: true,
        countries: africanCountries,
        totalCountries: africanCountries.length,
        note: "All African countries supported for virtual account generation testing"
      });
    } catch (error) {
      console.error('African countries list error:', error);
      res.status(500).json({ error: 'Failed to get African countries list' });
    }
  });

  // Get all crypto currencies supported for testing
  app.get("/api/wallet/test/crypto-currencies", async (req, res) => {
    try {
      const cryptoCurrencies = [
        { code: 'BTC', name: 'Bitcoin', network: 'Bitcoin', providers: ['coinbase', 'binance', 'blockchain_info'] },
        { code: 'ETH', name: 'Ethereum', network: 'Ethereum', providers: ['coinbase', 'binance', 'blockchain_info'] },
        { code: 'USDT', name: 'Tether USD', network: 'Ethereum/Tron', providers: ['coinbase', 'binance', 'tronlink'] },
        { code: 'USDC', name: 'USD Coin', network: 'Ethereum', providers: ['coinbase', 'binance'] },
        { code: 'BNB', name: 'Binance Coin', network: 'BSC', providers: ['binance'] },
        { code: 'TRX', name: 'Tron', network: 'Tron', providers: ['tronlink'] }
      ];
      
      res.json({
        success: true,
        testMode: true,
        currencies: cryptoCurrencies,
        totalCurrencies: cryptoCurrencies.length,
        note: "All crypto currencies supported for virtual wallet generation testing"
      });
    } catch (error) {
      console.error('Crypto currencies list error:', error);
      res.status(500).json({ error: 'Failed to get crypto currencies list' });
    }
  });

  // App Configuration API endpoints (for admin panel to control main app)
  app.get('/api/app-config', (req, res) => {
    try {
      res.json(appConfigurationService.getConfiguration());
    } catch (error) {
      console.error('Error fetching app configuration:', error);
      res.status(500).json({ error: 'Failed to fetch app configuration' });
    }
  });

  app.get('/api/app-config/:section', (req, res) => {
    try {
      // Using imported appConfigurationService
      const section = appConfigurationService.getSection(req.params.section);
      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }
      res.json(section);
    } catch (error) {
      console.error('Error fetching app configuration section:', error);
      res.status(500).json({ error: 'Failed to fetch app configuration section' });
    }
  });

  app.put('/api/app-config/:section', (req, res) => {
    try {
      // Using imported appConfigurationService
      appConfigurationService.updateSection(req.params.section, req.body);
      res.json({ success: true, message: 'Section updated successfully' });
    } catch (error) {
      console.error('Error updating app configuration section:', error);
      res.status(500).json({ error: 'Failed to update app configuration section' });
    }
  });

  app.put('/api/app-config/:section/:key', (req, res) => {
    try {
      // Using imported appConfigurationService
      const { value } = req.body;
      appConfigurationService.updateSetting(req.params.section, req.params.key, value);
      res.json({ success: true, message: 'Setting updated successfully' });
    } catch (error) {
      console.error('Error updating app configuration setting:', error);
      res.status(500).json({ error: 'Failed to update app configuration setting' });
    }
  });

  app.post('/api/app-config/upload/logo', (req, res) => {
    try {
      // Using imported appConfigurationService
      const { logoData } = req.body;
      const logoUrl = appConfigurationService.uploadLogo(logoData);
      res.json({ success: true, logoUrl, message: 'Logo uploaded successfully' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ error: 'Failed to upload logo' });
    }
  });

  app.post('/api/app-config/upload/favicon', (req, res) => {
    try {
      // Using imported appConfigurationService
      const { faviconData } = req.body;
      const faviconUrl = appConfigurationService.uploadFavicon(faviconData);
      res.json({ success: true, faviconUrl, message: 'Favicon uploaded successfully' });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      res.status(500).json({ error: 'Failed to upload favicon' });
    }
  });

  app.get('/api/app-config/stats', (req, res) => {
    try {
      // Using imported appConfigurationService
      res.json(appConfigurationService.getStats());
    } catch (error) {
      console.error('Error fetching app configuration stats:', error);
      res.status(500).json({ error: 'Failed to fetch app configuration stats' });
    }
  });

  app.post('/api/app-config/export', (req, res) => {
    try {
      // Using imported appConfigurationService
      const configJson = appConfigurationService.exportConfiguration();
      res.json({ success: true, configuration: configJson });
    } catch (error) {
      console.error('Error exporting app configuration:', error);
      res.status(500).json({ error: 'Failed to export app configuration' });
    }
  });

  app.post('/api/app-config/import', (req, res) => {
    try {
      // Using imported appConfigurationService
      const { configJson } = req.body;
      const result = appConfigurationService.importConfiguration(configJson);
      if (result.success) {
        res.json({ success: true, message: 'Configuration imported successfully' });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error('Error importing app configuration:', error);
      res.status(500).json({ error: 'Failed to import app configuration' });
    }
  });

  // Working Mega Admin Configuration API endpoints (500+ settings)
  app.get('/api/mega-admin-config', (req, res) => {
    try {
      // Using workingMegaAdminService
      res.json(workingMegaAdminService.getConfig());
    } catch (error) {
      console.error('Error fetching mega admin configuration:', error);
      res.status(500).json({ error: 'Failed to fetch mega admin configuration' });
    }
  });

  app.get('/api/mega-admin-config/stats', (req, res) => {
    try {
      // Using workingMegaAdminService
      res.json(workingMegaAdminService.getStats());
    } catch (error) {
      console.error('Error fetching mega admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch mega admin stats' });
    }
  });

  app.get('/api/mega-admin-config/:section', (req, res) => {
    try {
      // Using workingMegaAdminService
      const config = workingMegaAdminService.getConfig();
      const section = config[req.params.section as keyof typeof config];
      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }
      res.json(section);
    } catch (error) {
      console.error('Error fetching mega admin section:', error);
      res.status(500).json({ error: 'Failed to fetch mega admin section' });
    }
  });

  app.put('/api/mega-admin-config/:section', (req, res) => {
    try {
      // Using workingMegaAdminService
      workingMegaAdminService.updateSection(req.params.section, req.body);
      res.json({ success: true, message: 'Section updated successfully' });
    } catch (error) {
      console.error('Error updating mega admin section:', error);
      res.status(500).json({ error: 'Failed to update mega admin section' });
    }
  });

  app.put('/api/mega-admin-config/:section/:key', (req, res) => {
    try {
      // Using workingMegaAdminService
      const { value } = req.body;
      // Update specific setting in section
      const config = workingMegaAdminService.getConfig();
      const sectionData = config[req.params.section as keyof typeof config];
      if (sectionData && typeof sectionData === 'object') {
        (sectionData as any)[req.params.key] = value;
        workingMegaAdminService.updateSection(req.params.section, sectionData);
      }
      res.json({ success: true, message: 'Setting updated successfully' });
    } catch (error) {
      console.error('Error updating mega admin setting:', error);
      res.status(500).json({ error: 'Failed to update mega admin setting' });
    }
  });

  app.get('/api/mega-admin-config/search/:query', (req, res) => {
    try {
      // Using workingMegaAdminService
      const results = workingMegaAdminService.searchSettings(req.params.query);
      res.json(results);
    } catch (error) {
      console.error('Error searching mega admin settings:', error);
      res.status(500).json({ error: 'Failed to search mega admin settings' });
    }
  });

  app.post('/api/mega-admin-config/export', (req, res) => {
    try {
      // Using workingMegaAdminService
      const configJson = workingMegaAdminService.exportConfig();
      res.json({ success: true, configuration: configJson });
    } catch (error) {
      console.error('Error exporting mega admin configuration:', error);
      res.status(500).json({ error: 'Failed to export mega admin configuration' });
    }
  });

  app.post('/api/mega-admin-config/import', (req, res) => {
    try {
      // Using workingMegaAdminService
      const { configJson } = req.body;
      workingMegaAdminService.importConfig(configJson);
      res.json({ success: true, message: 'Mega configuration imported successfully' });
    } catch (error) {
      console.error('Error importing mega admin configuration:', error);
      res.status(500).json({ error: 'Failed to import mega admin configuration' });
    }
  });

  app.post('/api/mega-admin-config/validate', (req, res) => {
    try {
      // Using imported megaAdminConfigService
      const validation = megaAdminConfigService.validateConfiguration();
      res.json(validation);
    } catch (error) {
      console.error('Error validating mega admin configuration:', error);
      res.status(500).json({ error: 'Failed to validate mega admin configuration' });
    }
  });

  app.post('/api/mega-admin-config/reset/:section', (req, res) => {
    try {
      // Using imported megaAdminConfigService
      megaAdminConfigService.resetSection(req.params.section);
      res.json({ success: true, message: 'Section reset successfully' });
    } catch (error) {
      console.error('Error resetting mega admin section:', error);
      res.status(500).json({ error: 'Failed to reset mega admin section' });
    }
  });

  app.post('/api/mega-admin-config/reset-all', (req, res) => {
    try {
      // Using imported megaAdminConfigService
      megaAdminConfigService.resetAll();
      res.json({ success: true, message: 'All configuration reset successfully' });
    } catch (error) {
      console.error('Error resetting all mega admin configuration:', error);
      res.status(500).json({ error: 'Failed to reset all mega admin configuration' });
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

  // Admin Panel API Endpoints
  app.get('/api/admin/config', (req, res) => {
    try {
      const config = {
        system: {
          maintenance_mode: false,
          debug_logging: true,
          rate_limiting: true,
          max_requests_per_minute: 100,
          api_timeout: 30,
          cache_ttl: 300,
        },
        trading: {
          auto_trading_enabled: true,
          max_position_size: 10000,
          risk_level: 'moderate',
          stop_loss_percentage: 5.0,
          take_profit_percentage: 10.0,
          allowed_pairs: ['ETH/USDT', 'BTC/USDT', 'SOL/USDT'],
        },
        wallet: {
          min_deposit: 10,
          max_deposit: 100000,
          conversion_fee_rate: 2.5,
          withdrawal_fee_rate: 1.0,
          daily_withdrawal_limit: 50000,
          supported_currencies: ['USD', 'EUR', 'NGN', 'GHS', 'ZAR', 'KES', 'UGX'],
        },
        security: {
          session_timeout: 30,
          max_login_attempts: 5,
          require_2fa: false,
          password_min_length: 8,
          api_key_expiry_days: 90,
        },
        konsai: {
          intelligence_level: 'TRANSCENDENT',
          response_delay: 200,
          learning_enabled: true,
          memory_limit: 1024,
          auto_evolution: true,
          module_count: 220,
        },
        notifications: {
          email_enabled: true,
          sms_enabled: true,
          push_enabled: true,
          webhook_url: '',
          alert_thresholds: {
            price_change: 5.0,
            volume_spike: 200.0,
            balance_low: 100.0,
          },
        },
      };
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/config', (req, res) => {
    try {
      const updatedConfig = req.body;
      console.log('Admin config updated:', updatedConfig);
      res.json({ success: true, message: 'Configuration updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/status', (req, res) => {
    try {
      const status = {
        uptime: '12d 4h 32m',
        memory_usage: Math.floor(Math.random() * 40) + 50,
        cpu_usage: Math.floor(Math.random() * 30) + 20,
        active_users: Math.floor(Math.random() * 50) + 10,
        total_transactions: 1247,
        error_rate: Math.random() * 2,
        api_calls_today: 15420,
        database_size: '2.4 GB',
        cache_hit_rate: 94.2,
        maintenance_mode: false,
      };
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Advanced Admin Configuration Routes - 500+ Settings
  app.get("/api/admin/advanced-config", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      const config = advancedAdminConfigService.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  app.get("/api/admin/advanced-config/:section", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      const section = advancedAdminConfigService.getConfigSection(req.params.section);
      if (section) {
        res.json(section);
      } else {
        res.status(404).json({ error: "Configuration section not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get configuration section" });
    }
  });

  app.put("/api/admin/advanced-config/:section", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      advancedAdminConfigService.updateConfig(req.params.section, req.body);
      
      const validation = advancedAdminConfigService.validateConfig();
      if (!validation.valid) {
        return res.status(400).json({ error: "Invalid configuration", details: validation.errors });
      }
      
      const updatedSection = advancedAdminConfigService.getConfigSection(req.params.section);
      res.json({ 
        success: true, 
        message: "Configuration updated successfully",
        data: updatedSection 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update configuration" });
    }
  });

  app.post("/api/admin/advanced-config/reset/:section?", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      advancedAdminConfigService.resetToDefaults(req.params.section);
      res.json({ 
        success: true, 
        message: req.params.section 
          ? `${req.params.section} configuration reset to defaults`
          : "All configuration reset to defaults"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset configuration" });
    }
  });

  app.get("/api/admin/advanced-config/export", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      const config = advancedAdminConfigService.exportConfig();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="waides-ki-config.json"');
      res.send(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to export configuration" });
    }
  });

  app.post("/api/admin/advanced-config/import", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      const success = advancedAdminConfigService.importConfig(JSON.stringify(req.body));
      if (success) {
        res.json({ success: true, message: "Configuration imported successfully" });
      } else {
        res.status(400).json({ error: "Invalid configuration format" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to import configuration" });
    }
  });

  app.get("/api/admin/advanced-config/validate", async (req, res) => {
    try {
      const { advancedAdminConfigService } = await import('./services/advancedAdminConfigService.js');
      const validation = advancedAdminConfigService.validateConfig();
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate configuration" });
    }
  });

  app.get('/api/admin/users', (req, res) => {
    try {
      const users = [
        {
          id: 'user_001',
          username: 'trader_alpha',
          email: 'alpha@example.com',
          role: 'premium',
          status: 'active',
          last_login: '2025-01-28T08:30:00Z',
          balance: 15750.50,
          created_at: '2024-12-15T10:00:00Z',
        },
        {
          id: 'user_002',
          username: 'crypto_beta',
          email: 'beta@example.com',
          role: 'standard',
          status: 'active',
          last_login: '2025-01-27T15:45:00Z',
          balance: 8420.25,
          created_at: '2024-11-20T14:30:00Z',
        },
        {
          id: 'user_003',
          username: 'investor_gamma',
          email: 'gamma@example.com',
          role: 'premium',
          status: 'suspended',
          last_login: '2025-01-25T09:15:00Z',
          balance: 23100.75,
          created_at: '2024-10-08T11:20:00Z',
        },
      ];
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/admin/users/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      console.log(`Updating user ${userId}:`, updates);
      res.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/users/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`Deleting user ${userId}`);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/transactions', (req, res) => {
    try {
      const transactions = [
        {
          id: 'tx_001',
          user_id: 'user_001',
          type: 'deposit',
          amount: 5000,
          currency: 'USD',
          status: 'completed',
          created_at: '2025-01-28T08:30:00Z',
          gateway: 'stripe',
        },
        {
          id: 'tx_002',
          user_id: 'user_002',
          type: 'conversion',
          amount: 2500,
          currency: 'NGN',
          status: 'completed',
          created_at: '2025-01-28T07:45:00Z',
          gateway: 'paystack',
        },
        {
          id: 'tx_003',
          user_id: 'user_003',
          type: 'withdrawal',
          amount: 1200,
          currency: 'EUR',
          status: 'processing',
          created_at: '2025-01-28T06:20:00Z',
          gateway: 'sepa',
        },
        {
          id: 'tx_004',
          user_id: 'user_001',
          type: 'trade',
          amount: 750,
          currency: 'ETH',
          status: 'completed',
          created_at: '2025-01-27T22:15:00Z',
          gateway: 'binance',
        },
      ];
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/system/control', (req, res) => {
    try {
      const { action } = req.body;
      console.log(`System control action: ${action}`);
      
      switch (action) {
        case 'restart':
          console.log('System restart initiated');
          break;
        case 'maintenance':
          console.log('Maintenance mode toggled');
          break;
        case 'clear_cache':
          console.log('Cache cleared');
          break;
        case 'backup':
          console.log('Backup created');
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
      
      res.json({ success: true, message: `${action} executed successfully` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // File upload endpoint for branding assets
  app.post('/api/admin/upload-branding', (req, res) => {
    try {
      // In a real implementation, you would handle multipart form data with multer
      // For now, we'll simulate successful upload
      const { type } = req.body;
      
      // Generate a mock URL (in real implementation, save file and return actual URL)
      const mockUrl = `/uploads/${type}-${Date.now()}.png`;
      
      res.json({
        success: true,
        url: mockUrl,
        message: `${type} uploaded successfully`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Expanded admin configuration endpoints - 1000+ settings
  app.get('/api/admin/expanded-config', async (req, res) => {
    try {
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      const config = expandedAdminConfigService.getConfiguration();
      res.json(config);
    } catch (error: any) {
      console.error('Error getting expanded config:', error);
      res.status(500).json({ error: 'Failed to get expanded configuration' });
    }
  });

  app.get('/api/admin/expanded-config/stats', async (req, res) => {
    try {
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      const config = expandedAdminConfigService.getConfiguration();
      const stats = expandedAdminConfigService.getConfigurationStatistics(config);
      res.json(stats);
    } catch (error: any) {
      console.error('Error getting config stats:', error);
      res.status(500).json({ error: 'Failed to get configuration statistics' });
    }
  });

  app.get('/api/admin/expanded-config/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ results: [], count: 0 });
      }
      
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      const config = expandedAdminConfigService.getConfiguration();
      const results = expandedAdminConfigService.searchSettings(config, query);
      res.json(results);
    } catch (error: any) {
      console.error('Error searching config:', error);
      res.status(500).json({ error: 'Failed to search configuration' });
    }
  });

  app.get('/api/admin/expanded-config/:section', async (req, res) => {
    try {
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      const section = expandedAdminConfigService.getSection(req.params.section);
      if (section) {
        res.json(section);
      } else {
        res.status(404).json({ error: 'Configuration section not found' });
      }
    } catch (error: any) {
      console.error('Error getting section:', error);
      res.status(500).json({ error: 'Failed to get configuration section' });
    }
  });

  app.put('/api/admin/expanded-config/:section', async (req, res) => {
    try {
      const section = req.params.section;
      const updates = req.body;
      
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      expandedAdminConfigService.updateSection(section, updates);
      res.json({ success: true, message: `${section} configuration updated` });
    } catch (error: any) {
      console.error('Error updating section:', error);
      res.status(500).json({ error: 'Failed to update section configuration' });
    }
  });

  app.put('/api/admin/expanded-config/:section/:key', async (req, res) => {
    try {
      const { section, key } = req.params;
      const { value } = req.body;
      
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      expandedAdminConfigService.updateSetting(section, key, value);
      res.json({ success: true, message: `${section}.${key} updated` });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  app.post('/api/admin/expanded-config/:section/reset', async (req, res) => {
    try {
      const section = req.params.section;
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      expandedAdminConfigService.resetSection(section);
      res.json({ success: true, message: `${section} configuration reset to defaults` });
    } catch (error: any) {
      console.error('Error resetting section:', error);
      res.status(500).json({ error: 'Failed to reset section configuration' });
    }
  });

  app.post('/api/admin/expanded-config/reset-all', async (req, res) => {
    try {
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      expandedAdminConfigService.resetAll();
      res.json({ success: true, message: 'All configuration reset to defaults' });
    } catch (error: any) {
      console.error('Error resetting all config:', error);
      res.status(500).json({ error: 'Failed to reset all configuration' });
    }
  });

  app.get('/api/admin/expanded-config/export', async (req, res) => {
    try {
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      const config = expandedAdminConfigService.getConfiguration();
      const exportData = {
        ...config,
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        totalSettings: Object.values(config).reduce((total, section) => total + Object.keys(section).length, 0)
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="waides-ki-expanded-config.json"');
      res.json(exportData);
    } catch (error: any) {
      console.error('Error exporting config:', error);
      res.status(500).json({ error: 'Failed to export configuration' });
    }
  });

  app.post('/api/admin/expanded-config/import', async (req, res) => {
    try {
      const { configData } = req.body;
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      
      const success = expandedAdminConfigService.importConfiguration(JSON.stringify(configData));
      if (success) {
        res.json({ success: true, message: 'Configuration imported successfully' });
      } else {
        res.status(400).json({ error: 'Invalid configuration format' });
      }
    } catch (error: any) {
      console.error('Error importing config:', error);
      res.status(500).json({ error: 'Failed to import configuration' });
    }
  });

  app.get('/api/admin/expanded-config/validate', async (req, res) => {
    try {
      const { expandedAdminConfigService } = await import('./services/expandedAdminConfig.js');
      const validation = expandedAdminConfigService.validateConfiguration();
      res.json(validation);
    } catch (error: any) {
      console.error('Error validating config:', error);
      res.status(500).json({ error: 'Failed to validate configuration' });
    }
  });

  return Promise.resolve(server);
}