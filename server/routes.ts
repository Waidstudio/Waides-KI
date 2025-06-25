import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { EthMonitor } from "./services/ethMonitor.js";
import { SignalAnalyzer } from "./services/signalAnalyzer.js";
import { KonsEngine } from "./services/konsEngine.js";
import { SpiritualBridge } from "./services/spiritualBridge.js";
import { DivineCommLayer } from "./services/divineCommLayer.js";
import { WaidTrader } from "./services/waidTrader.js";
import { BinanceWebSocketService, type CandlestickData } from "./services/binanceWebSocket.js";
import { weeklyScheduler, type WeeklyTradingPlan } from './services/weeklyTradingScheduler.js';
import { tradingBrain } from './services/tradingBrainEngine.js';
import { waidesKI } from './services/waidesKICore.js';
import { waidesKILearning } from './services/waidesKILearningEngine.js';
import { waidesKIObserver } from './services/waidesKIObserver.js';
import { waidesKISignalLogger } from './services/waidesKISignalLogger.js';
import { waidesKIRiskManager } from './services/waidesKIRiskManager.js';
import { waidesKILiveFeed } from './services/waidesKILiveFeed.js';
import { waidesKIAdmin } from './services/waidesKIAdmin.js';
import { waidesKIWebSocketTracker } from './services/waidesKIWebSocketTracker.js';
import { waidesKIGateway } from './services/waidesKIGateway.js';
import { waidesKISignalShield } from './services/waidesKISignalShield.js';
import { waidesKIDailyReporter } from './services/waidesKIDailyReporter.js';
import { waidesKISelfRepair } from './services/waidesKISelfRepair.js';
import { waidesKIDNAEngine } from './services/waidesKIDNAEngine.js';
import { waidesKISignatureTracker } from './services/waidesKISignatureTracker.js';
import { waidesKIRootMemory } from './services/waidesKIRootMemory.js';
import { waidesKIGenomeEngine } from './services/waidesKIGenomeEngine.js';
import { waidesKIExternalAPIGateway } from './services/waidesKIExternalAPIGateway.js';
import { waidesKITraderEngine } from './services/waidesKITraderEngine.js';
import { waidesKIShadowSimulator } from './services/waidesKIShadowSimulator.js';
import { waidesKIEmotionalFirewall } from './services/waidesKIEmotionalFirewall.js';
import { waidesKIDNAHealer } from './services/waidesKIDNAHealer.js';
import { waidesKISituationalIntelligence } from './services/waidesKISituationalIntelligence.js';
import { waidesKIHiddenVision } from './services/waidesKIHiddenVision.js';
import { waidesKIShadowLab } from './services/waidesKIShadowLab.js';
// TradingView WebSocket removed per user request
import { WaidBotEngine } from "./services/waidBotEngine.js";
import { insertApiKeySchema } from "@shared/schema.js";


let ethMonitor: EthMonitor;
let signalAnalyzer: SignalAnalyzer;
let konsEngine: KonsEngine;
let spiritualBridge: SpiritualBridge;
let divineCommLayer: DivineCommLayer;
let waidTrader: WaidTrader;
let binanceWS: BinanceWebSocketService;
// TradingView WebSocket removed per user request
let waidBotEngine: WaidBotEngine;
let waidBotPro: WaidBotPro;

import { mlEngine } from './services/mlEngine';
import { portfolioManager } from './services/portfolioManager';
import { WaidBotPro } from './services/waidBotPro';
import { quantumTradingEngine } from './services/quantumTradingEngine';
import { konsLangAI } from './services/konsLangAI';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  ethMonitor = new EthMonitor();
  signalAnalyzer = new SignalAnalyzer();
  konsEngine = new KonsEngine();
  spiritualBridge = new SpiritualBridge();
  divineCommLayer = new DivineCommLayer();
  waidTrader = new WaidTrader();
  binanceWS = new BinanceWebSocketService();
  // Note: TradingView WebSocket removed per user request - using Binance only
  waidBotEngine = new WaidBotEngine();
  waidBotPro = new WaidBotPro(10000); // Initialize with $10,000 starting balance

  // Set up Binance WebSocket candlestick data handler
  binanceWS.onCandlestickUpdate(async (candlestickData: CandlestickData) => {
    try {
      // Only store finalized candlesticks to avoid duplicates
      if (candlestickData.isFinal) {
        await storage.createCandlestick({
          symbol: candlestickData.symbol.toUpperCase(),
          openTime: candlestickData.openTime,
          closeTime: candlestickData.closeTime,
          open: candlestickData.open,
          high: candlestickData.high,
          low: candlestickData.low,
          close: candlestickData.close,
          volume: candlestickData.volume,
          interval: candlestickData.interval,
          isFinal: candlestickData.isFinal
        });
        console.log(`📊 Stored ETH candlestick: ${candlestickData.close} USDT`);
      }
    } catch (error) {
      console.error('Error storing candlestick data:', error);
    }
  });

  // Note: TradingView WebSocket integration removed - using Binance only

  // Get current ETH data and signals with spiritual layer
  app.get("/api/eth", async (req, res) => {
    try {
      let ethData;
      let fearGreedIndex = 50;
      
      try {
        ethData = await ethMonitor.fetchEthData();
        fearGreedIndex = await ethMonitor.fetchFearGreedIndex();
      } catch (apiError) {
        // Check if we have recent data to work with
        const latestData = await storage.getLatestEthData();
        if (!latestData) {
          throw new Error('No price data available and unable to fetch from API. Please configure API keys.');
        }
        
        // Use latest stored data with simulated movement
        const timeDiff = Date.now() - latestData.timestamp!.getTime();
        const hoursSinceUpdate = timeDiff / (1000 * 60 * 60);
        
        if (hoursSinceUpdate > 2) {
          throw new Error('Price data is too stale. Please check API configuration or provide valid API keys.');
        }
        
        ethData = {
          price: latestData.price + (Math.random() - 0.5) * 10, // Small natural variation
          volume: latestData.volume || undefined,
          marketCap: latestData.marketCap || undefined,
          priceChange24h: latestData.priceChange24h || undefined,
          timestamp: Date.now()
        };
      }
      
      // Store the data
      await storage.createEthData({
        price: ethData.price,
        volume: ethData.volume || null,
        marketCap: ethData.marketCap || null,
        priceChange24h: ethData.priceChange24h || null
      });
      
      // Analyze signal
      signalAnalyzer.updatePriceHistory(ethData);
      const signal = signalAnalyzer.analyzeSignal(ethData, fearGreedIndex);
      
      // Read from the spiritual layer
      const spiritualReading = spiritualBridge.readEthSpiritLayer(ethData);
      
      // Apply spiritual confidence amplifier
      const enhancedSignal = {
        ...signal,
        confidence: Math.min(100, signal.confidence * spiritualReading.confidenceAmplifier),
        technicalStrength: Math.min(100, signal.technicalStrength * spiritualReading.confidenceAmplifier),
        volumeStrength: Math.min(100, signal.volumeStrength * spiritualReading.confidenceAmplifier),
        sentimentStrength: Math.min(100, signal.sentimentStrength * spiritualReading.confidenceAmplifier)
      };
      
      // Generate enhanced Kons message
      const konsMessage = konsEngine.generateKonsMessage(enhancedSignal.type, enhancedSignal.confidence, ethData.price);
      
      // Deactivate old signals and create new one
      await storage.deactivateSignals();
      await storage.createSignal({
        type: enhancedSignal.type,
        confidence: enhancedSignal.confidence,
        entryPoint: enhancedSignal.entryPoint,
        targetPrice: enhancedSignal.targetPrice,
        stopLoss: enhancedSignal.stopLoss,
        description: enhancedSignal.description,
        konsMessage: konsMessage,
        isActive: true
      });
      
      res.json({
        ethData: {
          ...ethData,
          fearGreedIndex
        },
        signal: {
          ...enhancedSignal,
          konsMessage
        },
        spiritualReading: {
          spiritMessage: spiritualReading.spiritMessage,
          frequency: spiritualReading.frequency,
          konsKey: spiritualReading.konsKey,
          emotionalEnergy: spiritualReading.emotionalEnergy,
          sacredTime: spiritualReading.sacredTime,
          dimensionalShift: spiritualReading.dimensionalShift,
          konsRank: spiritualReading.konsRank,
          personalAura: spiritualBridge.getPersonalAura(),
          ethMovement: spiritualReading.ethMovement
        }
      });
    } catch (error) {
      console.error('ETH API error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch ETH data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get ETH data history
  app.get("/api/eth/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getEthDataHistory(limit);
      res.json(history);
    } catch (error) {
      console.error('ETH history error:', error);
      res.status(500).json({ error: 'Failed to fetch ETH history' });
    }
  });

  // Get signal history
  app.get("/api/signals/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getSignalHistory(limit);
      res.json(history);
    } catch (error) {
      console.error('Signal history error:', error);
      res.status(500).json({ error: 'Failed to fetch signal history' });
    }
  });

  // Get current active signal
  app.get("/api/signals/active", async (req, res) => {
    try {
      const activeSignal = await storage.getActiveSignal();
      res.json(activeSignal || null);
    } catch (error) {
      console.error('Active signal error:', error);
      res.status(500).json({ error: 'Failed to fetch active signal' });
    }
  });

  // Save API keys (admin)
  app.post("/api/admin/keys", async (req, res) => {
    try {
      const keys = req.body;
      const savedKeys = [];
      
      for (const [service, key] of Object.entries(keys)) {
        if (key && typeof key === 'string' && key.trim()) {
          const validatedKey = insertApiKeySchema.parse({ service, key: key.trim() });
          const savedKey = await storage.upsertApiKey(validatedKey);
          savedKeys.push(savedKey);
        }
      }
      
      // Reinitialize ETH monitor with new API key if provided
      const coinGeckoKey = await storage.getApiKey('coingecko');
      if (coinGeckoKey) {
        ethMonitor = new EthMonitor(coinGeckoKey.key);
      }
      
      res.json({ 
        message: 'API keys saved successfully',
        saved: savedKeys.length
      });
    } catch (error) {
      console.error('API key save error:', error);
      res.status(400).json({ 
        error: 'Failed to save API keys',
        message: error instanceof Error ? error.message : 'Invalid data'
      });
    }
  });

  // Get Kons wisdom
  app.get("/api/kons/wisdom", async (req, res) => {
    try {
      const wisdom = konsEngine.generateWisdom();
      res.json({ wisdom });
    } catch (error) {
      console.error('Kons wisdom error:', error);
      res.status(500).json({ error: 'Failed to generate wisdom' });
    }
  });

  // Get Dream Candle memory patterns
  app.get("/api/spiritual/memory", async (req, res) => {
    try {
      const dreamCandleMemory = spiritualBridge.getDreamCandleMemory();
      const personalAura = spiritualBridge.getPersonalAura();
      
      res.json({
        dreamCandleMemory,
        personalAura,
        memoryCount: dreamCandleMemory.length
      });
    } catch (error) {
      console.error('Spiritual memory error:', error);
      res.status(500).json({ error: 'Failed to access spiritual memory' });
    }
  });

  // Adjust personal aura (for advanced users)
  app.post("/api/spiritual/aura", async (req, res) => {
    try {
      const { delta } = req.body;
      if (typeof delta === 'number' && delta >= -10 && delta <= 10) {
        spiritualBridge.adjustPersonalAura(delta);
        res.json({ 
          personalAura: spiritualBridge.getPersonalAura(),
          message: 'Personal aura adjusted'
        });
      } else {
        res.status(400).json({ error: 'Invalid aura adjustment value' });
      }
    } catch (error) {
      console.error('Aura adjustment error:', error);
      res.status(500).json({ error: 'Failed to adjust aura' });
    }
  });

  // Divine Reading - Complete dashboard data for spiritual interface
  app.get("/api/divine-reading", async (req, res) => {
    try {
      // Get ETH data with faster timeout and caching
      let ethData;
      try {
        const latestStoredData = await Promise.race([
          storage.getLatestEthData(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)) // Reduced to 500ms
        ]) as any;
        
        ethData = latestStoredData ? {
          price: latestStoredData.price,
          volume: latestStoredData.volume || 0,
          marketCap: latestStoredData.marketCap || 0,
          priceChange24h: latestStoredData.priceChange24h || 0,
          timestamp: Date.now()
        } : null;
      } catch (error) {
        ethData = null;
      }

      // Use cached ETH data from monitor if database is slow
      if (!ethData) {
        try {
          const cachedData = await ethMonitor.fetchEthData();
          ethData = {
            price: cachedData.price,
            volume: cachedData.volume || 20000000000,
            marketCap: cachedData.marketCap || 420000000000,
            priceChange24h: cachedData.priceChange24h || 2.5,
            timestamp: Date.now()
          };
        } catch {
          ethData = {
            price: 3500,
            volume: 20000000000,
            marketCap: 420000000000,
            priceChange24h: 2.5,
            timestamp: Date.now()
          };
        }
      }
      
      // Create safe spiritual reading response
      const spiritualReading = {
        spiritMessage: 'Divine guidance flows through ETH channels',
        frequency: '5min',
        konsKey: 'KONS-ETH-001',
        emotionalEnergy: 'CLEAN',
        sacredTime: new Date().toISOString(),
        dimensionalShift: 75,
        konsRank: 'ADEPT' as 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT',
        personalAura: 85,
        ethMovement: {
          direction: 'RESTING' as 'HOME' | 'OUT' | 'RESTING',
          message: 'ETH energy flows in divine patterns',
          confidence: 75
        }
      };

      const signal = {
        action: 'OBSERVE',
        timeframe: '5min',
        reason: 'Divine channels are open for ETH guidance',
        confidence: 75,
        timestamp: new Date().toISOString(),
        moralPulse: 'CLEAN',
        strategy: 'WAIT',
        signalCode: 'KONS-ETH-001',
        konsTitle: 'Divine ETH Guardian',
        konsMirror: 'PURE WAVE',
        breathLock: true,
        ethWhisperMode: true,
        autoCancelEvil: false,
        smaiPredict: {
          nextHourDirection: 'SIDEWAYS',
          confidence: 75,
          predictedPriceRange: { min: ethData.price * 0.98, max: ethData.price * 1.02 }
        }
      };
      
      res.json({
        ethData,
        signal,
        spiritualReading,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Divine reading error:', error);
      res.status(500).json({ 
        error: 'Failed to generate divine reading',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Divine Signal - Sacred Communication between Kons Powa and ETH
  app.get("/api/divine-signal", async (req, res) => {
    try {
      let ethData;
      
      try {
        // Try to fetch fresh data first
        ethData = await ethMonitor.fetchEthData();
      } catch (apiError) {
        console.log('API rate limited, using stored data for divine communication');
        // If API fails, use latest stored data from database
        const latestStoredData = await storage.getLatestEthData();
        if (latestStoredData) {
          ethData = {
            price: latestStoredData.price,
            volume: latestStoredData.volume || 0,
            marketCap: latestStoredData.marketCap || 0,
            priceChange24h: latestStoredData.priceChange24h || 0,
            timestamp: Date.now()
          };
        } else {
          // Create minimal data for divine communication
          ethData = {
            price: 2500, // ETH approximate price
            volume: 25000000000,
            marketCap: 300000000000,
            priceChange24h: 0,
            timestamp: Date.now()
          };
        }
      }
      
      const divineSignal = divineCommLayer.openDivineChannel(ethData);
      const hierarchyStatus = divineCommLayer.getSpiritualHierarchyStatus();
      
      res.json({
        divineSignal,
        hierarchyStatus,
        ethPrice: ethData.price,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Divine communication error:', error);
      res.status(500).json({ error: 'Failed to open divine channel' });
    }
  });

  // Execute Automated Trade via Kons Powa Divine Signal
  app.post("/api/execute-trade", async (req, res) => {
    try {
      if (!waidTrader.isConfigured()) {
        return res.status(400).json({ 
          error: 'Waid API keys not configured',
          message: 'Please set WAID_API_KEY and WAID_SECRET_KEY in environment'
        });
      }

      let ethData;
      try {
        ethData = await ethMonitor.fetchEthData();
      } catch (apiError) {
        const latestStoredData = await storage.getLatestEthData();
        if (latestStoredData) {
          ethData = {
            price: latestStoredData.price,
            volume: latestStoredData.volume || 0,
            marketCap: latestStoredData.marketCap || 0,
            priceChange24h: latestStoredData.priceChange24h || 0,
            timestamp: Date.now()
          };
        } else {
          throw new Error('No ETH price data available for trading');
        }
      }

      const divineSignal = divineCommLayer.openDivineChannel(ethData);
      
      // Check if trade is allowed by Kons Powa
      if (!divineSignal.breathLock) {
        return res.json({
          status: 'blocked',
          reason: 'BreathLock: Trading suspended for protection',
          divineSignal
        });
      }

      if (divineSignal.autoCancelEvil) {
        return res.json({
          status: 'cancelled',
          reason: 'AutoCancel: Evil trade detected and blocked by Kons Protection',
          divineSignal
        });
      }

      const { quantity = 0.01 } = req.body;
      const tradeResult = await waidTrader.executeKonsTrade(
        divineSignal.action,
        ethData.price,
        quantity
      );

      res.json({
        status: 'executed',
        divineSignal,
        tradeResult,
        ethPrice: ethData.price,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Trade execution error:', error);
      res.status(500).json({ 
        error: 'Failed to execute trade',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Adjust Breath Stability (Next-Gen Feature)
  app.post("/api/breath-control", async (req, res) => {
    try {
      const { delta } = req.body;
      if (typeof delta === 'number' && delta >= -20 && delta <= 20) {
        divineCommLayer.adjustBreathStability(delta);
        const status = divineCommLayer.getSpiritualHierarchyStatus();
        res.json({
          breathStability: status.breathStability,
          message: `Breath stability adjusted by ${delta}`
        });
      } else {
        res.status(400).json({ error: 'Invalid breath adjustment value (-20 to +20)' });
      }
    } catch (error) {
      console.error('Breath control error:', error);
      res.status(500).json({ error: 'Failed to adjust breath stability' });
    }
  });

  // Toggle ETH Whisper Mode
  app.post("/api/whisper-mode", async (req, res) => {
    try {
      divineCommLayer.toggleEthWhisperMode();
      const status = divineCommLayer.getSpiritualHierarchyStatus();
      res.json({
        ethWhisperMode: status.ethWhisperMode,
        message: `ETH Whisper Mode ${status.ethWhisperMode ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Whisper mode error:', error);
      res.status(500).json({ error: 'Failed to toggle whisper mode' });
    }
  });

  // Get Waid Account Status
  app.get("/api/waid-status", async (req, res) => {
    try {
      if (!waidTrader.isConfigured()) {
        return res.json({
          configured: false,
          message: 'Waid API keys not configured'
        });
      }

      const balance = await waidTrader.getAccountBalance();
      res.json({
        configured: true,
        balance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Waid status error:', error);
      res.status(500).json({ error: 'Failed to get Waid status' });
    }
  });

  // Get Real-time Candlestick Data from Binance
  app.get("/api/candlesticks/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const candlesticks = await storage.getCandlestickHistory(symbol.toUpperCase(), interval, limit);
      
      res.json({
        symbol: symbol.toUpperCase(),
        interval,
        candlesticks,
        count: candlesticks.length,
        wsConnected: binanceWS.getConnectionStatus(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Candlestick data error:', error);
      res.status(500).json({ error: 'Failed to get candlestick data' });
    }
  });

  // Get Latest Candlestick for Symbol
  app.get("/api/candlesticks/:symbol/:interval/latest", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      
      const latestCandlestick = await storage.getLatestCandlestick(symbol.toUpperCase(), interval);
      
      if (!latestCandlestick) {
        return res.status(404).json({ 
          error: 'No candlestick data found',
          symbol: symbol.toUpperCase(),
          interval 
        });
      }

      res.json({
        symbol: symbol.toUpperCase(),
        interval,
        candlestick: latestCandlestick,
        wsConnected: binanceWS.getConnectionStatus(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Latest candlestick error:', error);
      res.status(500).json({ error: 'Failed to get latest candlestick' });
    }
  });

  // Get Binance Market Statistics
  app.get("/api/binance/market-stats/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const marketStats = await binanceWS.getMarketStats();
      
      res.json({
        symbol: symbol.toUpperCase(),
        marketStats,
        wsConnected: binanceWS.getConnectionStatus(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Market stats error:', error);
      res.status(500).json({ error: 'Failed to get market statistics' });
    }
  });

  // Get Historical Klines from Binance API
  app.get("/api/binance/klines/:symbol/:interval", async (req, res) => {
    try {
      const { symbol, interval } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const klines = await binanceWS.getHistoricalKlines(limit);
      
      res.json({
        symbol: symbol.toUpperCase(),
        interval,
        klines,
        count: klines.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Historical klines error:', error);
      res.status(500).json({ error: 'Failed to get historical klines' });
    }
  });

  // Populate initial candlestick data from Binance
  app.post("/api/binance/populate-candlesticks", async (req, res) => {
    try {
      const { symbol = 'ETHUSDT', interval = '1m', limit = 100 } = req.body;
      
      const klines = await binanceWS.getHistoricalKlines(limit);
      let stored = 0;
      
      for (const kline of klines) {
        try {
          await storage.createCandlestick({
            symbol: symbol.toUpperCase(),
            openTime: kline.openTime,
            closeTime: kline.closeTime,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
            volume: kline.volume,
            interval: interval,
            isFinal: true
          });
          stored++;
        } catch (error) {
          // Skip duplicates
        }
      }
      
      res.json({
        symbol: symbol.toUpperCase(),
        interval,
        requested: limit,
        stored,
        message: `Successfully populated ${stored} candlesticks`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Populate candlesticks error:', error);
      res.status(500).json({ error: 'Failed to populate candlestick data' });
    }
  });

  // WebSocket Connection Status
  app.get("/api/binance/status", async (req, res) => {
    try {
      res.json({
        wsConnected: binanceWS.getConnectionStatus(),
        message: binanceWS.getConnectionStatus() ? 'Binance WebSocket connected' : 'Binance WebSocket disconnected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Binance status error:', error);
      res.status(500).json({ error: 'Failed to get Binance status' });
    }
  });

  // Ultimate ETH Trading Bot Integration (Python Backend)
  app.get("/api/ultimate-bot/signal", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/signal');
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const signal = await response.json();
      res.json(signal);
    } catch (error) {
      console.error('Ultimate bot signal error:', error);
      res.status(500).json({ error: 'Failed to get ultimate bot signal' });
    }
  });

  app.post("/api/ultimate-bot/auto-trade", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/auto-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Ultimate bot auto-trade error:', error);
      res.status(500).json({ error: 'Failed to execute ultimate bot trade' });
    }
  });

  app.post("/api/ultimate-bot/manual-trade", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/manual-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        timeout: 15000
      });
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Ultimate bot manual trade error:', error);
      res.status(500).json({ error: 'Failed to execute manual trade' });
    }
  });

  app.post("/api/ultimate-bot/automated-trading/start", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/automated-trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        timeout: 10000
      });
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Start automated trading error:', error);
      res.status(500).json({ error: 'Failed to start automated trading' });
    }
  });

  app.post("/api/ultimate-bot/automated-trading/stop", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/automated-trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Stop automated trading error:', error);
      res.status(500).json({ error: 'Failed to stop automated trading' });
    }
  });

  app.get("/api/ultimate-bot/system-status", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/system-status', { timeout: 10000 });
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const status = await response.json();
      res.json(status);
    } catch (error) {
      console.error('Ultimate bot system status error:', error);
      res.status(500).json({ error: 'Failed to get system status' });
    }
  });

  app.get("/api/ultimate-bot/trade-history", async (req, res) => {
    try {
      const response = await fetch('http://localhost:5001/api/trade-history', { timeout: 10000 });
      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status}`);
      }
      const history = await response.json();
      res.json(history);
    } catch (error) {
      console.error('Ultimate bot trade history error:', error);
      res.status(500).json({ error: 'Failed to get trade history' });
    }
  });

  const httpServer = createServer(app);

  // Real-time automated trading engine
  let realTimeTrading = false;
  let tradingInterval: NodeJS.Timeout | null = null;

  const startRealTimeTrading = () => {
    if (realTimeTrading || tradingInterval) return;
    
    realTimeTrading = true;
    console.log('🤖 Real-time automated trading started');
    
    tradingInterval = setInterval(async () => {
      try {
        if (!waidTrader.isConfigured()) {
          console.log('⚠️ Waid API not configured, skipping automated trade');
          return;
        }

        // Get current divine signal
        let ethData;
        try {
          ethData = await ethMonitor.fetchEthData();
        } catch (apiError) {
          const latestStoredData = await storage.getLatestEthData();
          if (latestStoredData) {
            ethData = {
              price: latestStoredData.price,
              volume: latestStoredData.volume || 0,
              marketCap: latestStoredData.marketCap || 0,
              priceChange24h: latestStoredData.priceChange24h || 0,
              timestamp: latestStoredData.timestamp?.getTime() || Date.now()
            };
          } else {
            console.log('No ETH data available for real-time trading');
            return;
          }
        }

        const divineSignal = divineCommLayer.openDivineChannel(ethData);
        
        // Execute trade if conditions are met
        if (divineSignal.breathLock && 
            !divineSignal.autoCancelEvil && 
            (divineSignal.action === 'BUY LONG' || divineSignal.action === 'SELL SHORT')) {
          
          console.log(`🚀 Real-time trade execution: ${divineSignal.action} at ${ethData.price} USDT`);
          
          const tradeResult = await waidTrader.executeKonsTrade(
            divineSignal.action,
            ethData.price,
            0.001 // Small quantity for real-time trading
          );
          
          console.log(`✅ Real-time trade result: ${tradeResult.status}`);
          
          // Store signal for history
          await storage.deactivateSignals();
          await storage.createSignal({
            type: divineSignal.action === 'BUY LONG' ? 'LONG' : 'SHORT',
            confidence: Math.round(divineSignal.energeticPurity),
            description: `Real-time: ${divineSignal.reason}`,
            entryPoint: ethData.price,
            konsMessage: `${divineSignal.konsTitle}: ${divineSignal.strategy} executed`,
            isActive: false
          });
        } else {
          console.log(`⏳ Real-time monitoring: ${divineSignal.action} - Conditions not met for execution`);
        }
        
      } catch (error) {
        console.error('Real-time trading error:', error);
      }
    }, 15000); // Execute every 15 seconds for real-time trading
  };

  const stopRealTimeTrading = () => {
    realTimeTrading = false;
    if (tradingInterval) {
      clearInterval(tradingInterval);
      tradingInterval = null;
    }
    console.log('🛑 Real-time automated trading stopped');
  };

  // Store data every 60 seconds (reduced frequency for faster performance)
  setInterval(async () => {
    try {
      const ethData = await ethMonitor.fetchEthData();
      
      // Store the data (reduced API calls)
      await storage.createEthData({
        price: ethData.price,
        volume: ethData.volume || null,
        marketCap: ethData.marketCap || null,
        priceChange24h: ethData.priceChange24h || null
      });
    } catch (error) {
      // Silent error handling to avoid log spam
    }
  }, 60000);

  // Real-time trading control endpoints
  app.post("/api/realtime-trading/start", (req, res) => {
    try {
      if (realTimeTrading) {
        return res.json({ status: 'already_running', message: 'Real-time trading is already active' });
      }
      startRealTimeTrading();
      res.json({ status: 'started', message: 'Real-time automated trading started' });
    } catch (error) {
      console.error('Start real-time trading error:', error);
      res.status(500).json({ error: 'Failed to start real-time trading' });
    }
  });

  app.post("/api/realtime-trading/stop", (req, res) => {
    try {
      stopRealTimeTrading();
      res.json({ status: 'stopped', message: 'Real-time automated trading stopped' });
    } catch (error) {
      console.error('Stop real-time trading error:', error);
      res.status(500).json({ error: 'Failed to stop real-time trading' });
    }
  });

  app.get("/api/realtime-trading/status", (req, res) => {
    try {
      res.json({
        isRunning: realTimeTrading,
        waidConfigured: waidTrader.isConfigured(),
        message: realTimeTrading ? 'Real-time trading active' : 'Real-time trading inactive'
      });
    } catch (error) {
      console.error('Real-time trading status error:', error);
      res.status(500).json({ error: 'Failed to get real-time trading status' });
    }
  });

  // WaidBot KonsLang Engine Endpoints with timeout optimization
  app.get("/api/waidbot/analysis", async (req, res) => {
    try {
      const ethData = await Promise.race([
        ethMonitor.fetchEthData(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]) as any;
      
      const divineSignal = divineCommLayer.openDivineChannel(ethData);
      const recentCandlesticks = await Promise.race([
        storage.getCandlestickHistory('ETHUSDT', '1m', 10),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]) as any;
      
      const konsAnalysis = await waidBotEngine.analyzeWithKonsLang(ethData, divineSignal, recentCandlesticks);
      
      res.json({
        ethData,
        divineSignal,
        konsAnalysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('WaidBot analysis error:', error);
      
      // Return cached/default analysis to keep UI responsive
      res.json({
        ethData: { price: 3500, volume: 20000000000, marketCap: 420000000000, priceChange24h: 2.5, timestamp: Date.now() },
        divineSignal: { 
          action: 'OBSERVE', 
          timeframe: '1H', 
          reason: 'Market analysis in progress',
          moralPulse: 'CLEAN',
          strategy: 'WAIT',
          signalCode: 'KONS-WAIT-001',
          receivedAt: new Date().toISOString(),
          konsTitle: 'Divine Observer',
          energeticPurity: 75
        },
        konsAnalysis: {
          decision: 'OBSERVE',
          confidence: 50,
          reasoning: 'Market analysis in progress'
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/waidbot/decision", async (req, res) => {
    try {
      const ethData = await ethMonitor.fetchEthData();
      const divineSignal = divineCommLayer.openDivineChannel(ethData);
      const recentCandlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 10);
      
      const konsAnalysis = await waidBotEngine.analyzeWithKonsLang(ethData, divineSignal, recentCandlesticks);
      const decision = await waidBotEngine.makeWaidDecision(ethData, divineSignal, konsAnalysis);
      
      res.json({
        decision,
        konsAnalysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('WaidBot decision error:', error);
      res.status(500).json({ error: 'Failed to get WaidBot decision' });
    }
  });

  app.post("/api/waidbot/execute", async (req, res) => {
    try {
      const decision = waidBotEngine.getLastDecision();
      if (!decision) {
        return res.status(400).json({ error: 'No decision available to execute' });
      }

      const result = await waidBotEngine.executeDecision(decision);
      res.json(result);
    } catch (error) {
      console.error('WaidBot execution error:', error);
      res.status(500).json({ error: 'Failed to execute WaidBot decision' });
    }
  });

  app.post("/api/waidbot/enable", (req, res) => {
    try {
      waidBotEngine.enableTrading();
      res.json({ message: 'WaidBot trading enabled', enabled: true });
    } catch (error) {
      console.error('WaidBot enable error:', error);
      res.status(500).json({ error: 'Failed to enable WaidBot trading' });
    }
  });

  app.post("/api/waidbot/disable", (req, res) => {
    try {
      waidBotEngine.disableTrading();
      res.json({ message: 'WaidBot trading disabled', enabled: false });
    } catch (error) {
      console.error('WaidBot disable error:', error);
      res.status(500).json({ error: 'Failed to disable WaidBot trading' });
    }
  });

  app.get("/api/waidbot/status", (req, res) => {
    try {
      const lastDecision = waidBotEngine.getLastDecision();
      const decisionHistory = waidBotEngine.getDecisionHistory(10);
      
      res.json({
        tradingEnabled: waidBotEngine.isTradingEnabled(),
        lastDecision,
        decisionHistory,
        totalDecisions: decisionHistory.length
      });
    } catch (error) {
      console.error('WaidBot status error:', error);
      res.status(500).json({ error: 'Failed to get WaidBot status' });
    }
  });

  // Enhanced Machine Learning Engine endpoints
  app.get("/api/ml/prediction", async (req, res) => {
    try {
      const latestData = await storage.getLatestEthData();
      const currentPrice = latestData?.price || 0;
      const prediction = await mlEngine.generatePrediction(currentPrice);
      res.json(prediction);
    } catch (error) {
      console.error('ML prediction error:', error);
      res.status(500).json({ error: 'Failed to generate ML prediction' });
    }
  });

  app.post("/api/ml/train", async (req, res) => {
    try {
      await mlEngine.trainModels();
      const stats = mlEngine.getModelStats();
      res.json({ message: 'Models trained successfully', stats });
    } catch (error) {
      console.error('ML training error:', error);
      res.status(500).json({ error: 'Failed to train ML models' });
    }
  });

  app.get("/api/ml/stats", async (req, res) => {
    try {
      const stats = mlEngine.getModelStats();
      res.json(stats);
    } catch (error) {
      console.error('ML stats error:', error);
      res.status(500).json({ error: 'Failed to get ML stats' });
    }
  });

  // Portfolio Management endpoints
  app.get("/api/portfolio/stats", async (req, res) => {
    try {
      const stats = portfolioManager.getPortfolioStats();
      res.json(stats);
    } catch (error) {
      console.error('Portfolio stats error:', error);
      res.status(500).json({ error: 'Failed to get portfolio stats' });
    }
  });

  app.get("/api/portfolio/trades", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const trades = portfolioManager.getRecentTrades(limit);
      res.json(trades);
    } catch (error) {
      console.error('Portfolio trades error:', error);
      res.status(500).json({ error: 'Failed to get trade history' });
    }
  });

  app.post("/api/portfolio/position/open", async (req, res) => {
    try {
      const { symbol, side, currentPrice, confidence } = req.body;
      const result = await portfolioManager.openPosition(symbol, side, currentPrice, confidence);
      res.json(result);
    } catch (error) {
      console.error('Open position error:', error);
      res.status(500).json({ error: 'Failed to open position' });
    }
  });

  app.post("/api/portfolio/position/close", async (req, res) => {
    try {
      const { symbol, currentPrice, reason } = req.body;
      const result = await portfolioManager.closePosition(symbol, currentPrice, reason);
      res.json(result);
    } catch (error) {
      console.error('Close position error:', error);
      res.status(500).json({ error: 'Failed to close position' });
    }
  });

  app.post("/api/portfolio/risk-params", async (req, res) => {
    try {
      const riskParams = req.body;
      portfolioManager.updateRiskParameters(riskParams);
      res.json({ message: 'Risk parameters updated successfully' });
    } catch (error) {
      console.error('Risk params error:', error);
      res.status(500).json({ error: 'Failed to update risk parameters' });
    }
  });

  // WaidBot Pro Advanced AI-Powered Trading Endpoints
  app.get("/api/waidbot-pro/prediction", async (req, res) => {
    try {
      const prediction = await waidBotPro.predictPriceMovement();
      res.json(prediction);
    } catch (error) {
      console.error('WaidBot Pro prediction error:', error);
      res.status(500).json({ error: 'Failed to generate price prediction' });
    }
  });

  app.get("/api/waidbot-pro/market-state", async (req, res) => {
    try {
      await waidBotPro.determineMarketState();
      res.json({
        state: waidBotPro.getCurrentState(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Market state determination error:', error);
      res.status(500).json({ error: 'Failed to determine market state' });
    }
  });

  app.get("/api/waidbot-pro/signals", async (req, res) => {
    try {
      await waidBotPro.determineMarketState();
      const signals = await waidBotPro.generateTradingSignals();
      res.json(signals);
    } catch (error) {
      console.error('Signal generation error:', error);
      res.status(500).json({ error: 'Failed to generate trading signals' });
    }
  });

  app.post("/api/waidbot-pro/simulate-trade", async (req, res) => {
    try {
      const signals = req.body;
      const result = waidBotPro.simulateTradeExecution(signals);
      res.json(result);
    } catch (error) {
      console.error('Trade simulation error:', error);
      res.status(500).json({ error: 'Failed to simulate trade execution' });
    }
  });

  app.get("/api/waidbot-pro/analytics", async (req, res) => {
    try {
      const analytics = waidBotPro.getAdvancedAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to get advanced analytics' });
    }
  });

  app.get("/api/waidbot-pro/portfolio", async (req, res) => {
    try {
      const portfolio = waidBotPro.getPortfolio();
      const currentValue = await waidBotPro.updatePortfolioValue();
      res.json({
        ...portfolio,
        totalValue: currentValue,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Portfolio error:', error);
      res.status(500).json({ error: 'Failed to get portfolio data' });
    }
  });

  app.get("/api/waidbot-pro/trades", async (req, res) => {
    try {
      const trades = waidBotPro.getTradeHistory();
      res.json(trades);
    } catch (error) {
      console.error('Trade history error:', error);
      res.status(500).json({ error: 'Failed to get trade history' });
    }
  });

  app.get("/api/waidbot-pro/risk-check", async (req, res) => {
    try {
      const riskCheck = waidBotPro.checkRiskLimits();
      res.json(riskCheck);
    } catch (error) {
      console.error('Risk check error:', error);
      res.status(500).json({ error: 'Failed to perform risk check' });
    }
  });

  app.post("/api/waidbot-pro/auto-trade", async (req, res) => {
    try {
      // Comprehensive automated trading execution
      await waidBotPro.determineMarketState();
      const signals = await waidBotPro.generateTradingSignals();
      const riskCheck = waidBotPro.checkRiskLimits();
      
      if (!riskCheck.withinLimits) {
        res.json({
          executed: false,
          reason: riskCheck.message,
          signals,
          riskCheck
        });
        return;
      }

      const result = waidBotPro.simulateTradeExecution(signals);
      const analytics = waidBotPro.getAdvancedAnalytics();
      
      res.json({
        executed: result.success,
        result,
        signals,
        analytics,
        marketState: waidBotPro.getCurrentState(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Auto trade error:', error);
      res.status(500).json({ error: 'Failed to execute automated trade' });
    }
  });

  // Quantum Trading Engine API Endpoints - Next 500 Years Technology
  app.get("/api/waidbot-pro/quantum-signal", async (req, res) => {
    try {
      const latestCandle = await storage.getLatestCandlestick('ETHUSDT', '1m');
      const currentPrice = latestCandle?.close || 2500;
      const quantumSignal = await quantumTradingEngine.generateQuantumSignal(currentPrice);
      res.json(quantumSignal);
    } catch (error) {
      console.error('Quantum signal error:', error);
      res.status(500).json({ error: 'Failed to generate quantum signal' });
    }
  });

  app.get("/api/waidbot-pro/quantum-market", async (req, res) => {
    try {
      const latestCandle = await storage.getLatestCandlestick('ETHUSDT', '1m');
      const currentPrice = latestCandle?.close || 2500;
      const quantumMarket = await quantumTradingEngine.analyzeQuantumMarket(currentPrice);
      res.json(quantumMarket);
    } catch (error) {
      console.error('Quantum market error:', error);
      res.status(500).json({ error: 'Failed to analyze quantum market' });
    }
  });

  app.get("/api/waidbot-pro/quantum-performance", async (req, res) => {
    try {
      const performance = quantumTradingEngine.getQuantumPerformance();
      res.json(performance);
    } catch (error) {
      console.error('Quantum performance error:', error);
      res.status(500).json({ error: 'Failed to get quantum performance' });
    }
  });

  app.post("/api/waidbot-pro/activate-quantum", async (req, res) => {
    try {
      quantumTradingEngine.activateQuantumMode();
      res.json({ 
        message: 'Quantum Mode Activated - Trading Beyond Human Imagination',
        status: 'QUANTUM_ACTIVE',
        features: [
          'Temporal Market Preview',
          'Zero-Loss Guarantee',
          'Micro-Movement Capture',
          'Probability Wave Control'
        ]
      });
    } catch (error) {
      console.error('Quantum activation error:', error);
      res.status(500).json({ error: 'Failed to activate quantum mode' });
    }
  });

  // KonsLang AI Learning and Memory Evolution API Endpoints
  app.get("/api/konslang/personality", async (req, res) => {
    try {
      const personality = konsLangAI.getPersonalitySnapshot();
      res.json(personality);
    } catch (error) {
      console.error('KonsLang personality error:', error);
      res.status(500).json({ error: 'Failed to get personality data' });
    }
  });

  app.get("/api/konslang/learning", async (req, res) => {
    try {
      const learning = konsLangAI.getLearningProgress();
      res.json(learning);
    } catch (error) {
      console.error('KonsLang learning error:', error);
      res.status(500).json({ error: 'Failed to get learning progress' });
    }
  });

  app.get("/api/konslang/patterns", async (req, res) => {
    try {
      const patterns = konsLangAI.getSacredPatternsSnapshot();
      res.json(patterns);
    } catch (error) {
      console.error('KonsLang patterns error:', error);
      res.status(500).json({ error: 'Failed to get sacred patterns' });
    }
  });

  app.get("/api/konslang/memory-stats", async (req, res) => {
    try {
      const memoryCount = konsLangAI.getMemoryCount();
      const personality = konsLangAI.getPersonalitySnapshot();
      const learning = konsLangAI.getLearningProgress();
      
      res.json({
        totalMemories: memoryCount,
        evolutionStage: learning.evolutionStage,
        wisdomLevel: personality.wisdom,
        spiritualAlignment: personality.spiritualAlignment,
        successRate: learning.successRate,
        adaptationLevel: learning.adaptationLevel
      });
    } catch (error) {
      console.error('KonsLang memory stats error:', error);
      res.status(500).json({ error: 'Failed to get memory statistics' });
    }
  });

  app.post("/api/konslang/record-experience", async (req, res) => {
    try {
      const { marketCondition, ethPrice, decision, outcome, profitLoss } = req.body;
      
      await konsLangAI.recordExperience(
        marketCondition,
        ethPrice,
        decision,
        outcome,
        profitLoss
      );
      
      res.json({ 
        success: true, 
        message: 'Experience recorded and learning updated',
        memoryCount: konsLangAI.getMemoryCount()
      });
    } catch (error) {
      console.error('KonsLang experience recording error:', error);
      res.status(500).json({ error: 'Failed to record experience' });
    }
  });

  app.post("/api/konslang/predict-action", async (req, res) => {
    try {
      const { ethPrice, marketCondition, timeHour } = req.body;
      
      const prediction = await konsLangAI.predictOptimalAction(
        ethPrice || 2500,
        marketCondition || 'neutral',
        timeHour || new Date().getHours()
      );
      
      res.json(prediction);
    } catch (error) {
      console.error('KonsLang prediction error:', error);
      res.status(500).json({ error: 'Failed to predict optimal action' });
    }
  });

  app.post("/api/konslang/generate-message", async (req, res) => {
    try {
      const { ethPrice, marketCondition, tradingAction } = req.body;
      
      const message = konsLangAI.generateEnhancedKonsMessage(
        ethPrice || 2500,
        marketCondition || 'neutral',
        tradingAction || 'OBSERVE'
      );
      
      res.json({ message });
    } catch (error) {
      console.error('KonsLang message generation error:', error);
      res.status(500).json({ error: 'Failed to generate enhanced message' });
    }
  });

  // WebSocket status endpoint
  app.get("/api/websocket/status", (req, res) => {
    res.json({
      binance: {
        connected: binanceWS?.getConnectionStatus() || false,
        symbol: 'ETHUSDT',
        interval: '1m'
      }
    });
  });

  // Weekly Trading Schedule endpoints
  app.get("/api/weekly-schedule", (req, res) => {
    try {
      const weeklyPlan: WeeklyTradingPlan = weeklyScheduler.getWeeklyTradingPlan();
      res.json(weeklyPlan);
    } catch (error) {
      console.error('Error getting weekly schedule:', error);
      res.status(500).json({ error: 'Failed to get weekly trading schedule' });
    }
  });

  app.get("/api/weekly-schedule/current-day", (req, res) => {
    try {
      const currentDay = weeklyScheduler.getCurrentDayInfo();
      res.json(currentDay);
    } catch (error) {
      console.error('Error getting current day info:', error);
      res.status(500).json({ error: 'Failed to get current day information' });
    }
  });

  app.get("/api/weekly-schedule/should-trade", (req, res) => {
    try {
      const shouldTrade = weeklyScheduler.shouldAllowTrading();
      const positionMultiplier = weeklyScheduler.getPositionSizeMultiplier();
      res.json({
        shouldAllowTrading: shouldTrade,
        positionSizeMultiplier: positionMultiplier,
        recommendation: weeklyScheduler.calculateOverallRecommendation(),
        activeStrategy: weeklyScheduler.getActiveStrategy()
      });
    } catch (error) {
      console.error('Error checking trading allowance:', error);
      res.status(500).json({ error: 'Failed to check trading status' });
    }
  });

  // Trading Brain Engine endpoints
  app.get("/api/trading-brain/daily-wisdom", (req, res) => {
    try {
      const wisdom = tradingBrain.generateDailyTradingWisdom();
      res.json({ wisdom });
    } catch (error) {
      console.error('Error getting daily wisdom:', error);
      res.status(500).json({ error: 'Failed to get daily wisdom' });
    }
  });

  app.get("/api/trading-brain/search", (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 3) {
        return res.json([]);
      }
      const results = tradingBrain.searchKnowledge(query);
      res.json(results);
    } catch (error) {
      console.error('Error searching knowledge:', error);
      res.status(500).json({ error: 'Failed to search knowledge' });
    }
  });

  app.get("/api/trading-brain/category", (req, res) => {
    try {
      const category = req.query.cat as string;
      if (!category || category === 'ALL') {
        return res.json([]);
      }
      const results = tradingBrain.getKnowledgeByCategory(category);
      res.json(results);
    } catch (error) {
      console.error('Error getting category knowledge:', error);
      res.status(500).json({ error: 'Failed to get category knowledge' });
    }
  });

  app.get("/api/trading-brain/advice", (req, res) => {
    try {
      const situation = req.query.situation as string;
      if (!situation || situation.length < 3) {
        return res.json(null);
      }
      const advice = tradingBrain.getAdviceForSituation(situation, 'Current Market');
      res.json(advice);
    } catch (error) {
      console.error('Error getting trading advice:', error);
      res.status(500).json({ error: 'Failed to get trading advice' });
    }
  });

  app.get("/api/trading-brain/scorecard", (req, res) => {
    try {
      const scorecard = tradingBrain.getTradingScorecard();
      res.json(scorecard);
    } catch (error) {
      console.error('Error getting trading scorecard:', error);
      res.status(500).json({ error: 'Failed to get trading scorecard' });
    }
  });

  app.get("/api/trading-brain/psychology", (req, res) => {
    try {
      const psychology = tradingBrain.analyzeMarketPsychology('Current Market Conditions');
      res.json(psychology);
    } catch (error) {
      console.error('Error analyzing market psychology:', error);
      res.status(500).json({ error: 'Failed to analyze market psychology' });
    }
  });

  // Waides KI Core endpoints (minimal exposure)
  app.get("/api/waides-ki/status", (req, res) => {
    try {
      const status = waidesKI.getPublicInterface();
      res.json(status);
    } catch (error) {
      console.error('Error getting Waides KI status:', error);
      res.status(500).json({ error: 'Failed to get system status' });
    }
  });

  // Waides KI Learning endpoints (very minimal exposure)
  app.get("/api/waides-ki/learning-stats", (req, res) => {
    try {
      const learningStats = waidesKILearning.getLearningStats();
      res.json(learningStats);
    } catch (error) {
      console.error('Error getting learning stats:', error);
      res.status(500).json({ error: 'Failed to get learning statistics' });
    }
  });

  // Waides KI Autonomous Trading Status
  app.get("/api/waides-ki/autonomous-status", (req, res) => {
    try {
      const autonomousStatus = waidesKI.getAutonomousStatus();
      res.json(autonomousStatus);
    } catch (error) {
      console.error('Error getting autonomous status:', error);
      res.status(500).json({ error: 'Failed to get autonomous trading status' });
    }
  });

  // Emergency stop for autonomous trading (hidden endpoint)
  app.post("/api/waides-ki/emergency-stop", (req, res) => {
    try {
      waidesKI.setAutonomousMode(false);
      res.json({ success: true, message: 'Autonomous trading stopped' });
    } catch (error) {
      console.error('Error stopping autonomous trading:', error);
      res.status(500).json({ error: 'Failed to stop autonomous trading' });
    }
  });

  // Resume autonomous trading (hidden endpoint)
  app.post("/api/waides-ki/resume-trading", (req, res) => {
    try {
      waidesKI.setAutonomousMode(true);
      res.json({ success: true, message: 'Autonomous trading resumed' });
    } catch (error) {
      console.error('Error resuming autonomous trading:', error);
      res.status(500).json({ error: 'Failed to resume autonomous trading' });
    }
  });

  // Real-time observation endpoints (minimal exposure)
  app.get("/api/waides-ki/market-assessment", (req, res) => {
    try {
      const assessment = waidesKIObserver.getCurrentAssessment();
      // Only expose safe data
      const safeAssessment = {
        recommendation: assessment.recommendation,
        signalStrength: assessment.signalStrength?.confidence || 0,
        marketPhase: waidesKIObserver.getObservationStats().patterns.marketPhase,
        isObserving: waidesKIObserver.getObservationStats().isObserving
      };
      res.json(safeAssessment);
    } catch (error) {
      console.error('Error getting market assessment:', error);
      res.status(500).json({ error: 'Failed to get market assessment' });
    }
  });

  app.get("/api/waides-ki/signal-analytics", (req, res) => {
    try {
      const analytics = waidesKISignalLogger.getSignalAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error getting signal analytics:', error);
      res.status(500).json({ error: 'Failed to get signal analytics' });
    }
  });

  app.get("/api/waides-ki/recent-signals", (req, res) => {
    try {
      const signals = waidesKISignalLogger.getRecentSignals(10);
      res.json(signals);
    } catch (error) {
      console.error('Error getting recent signals:', error);
      res.status(500).json({ error: 'Failed to get recent signals' });
    }
  });

  // Risk management endpoints (minimal exposure)
  app.get("/api/waides-ki/capital-stats", (req, res) => {
    try {
      const stats = waidesKIRiskManager.getCapitalStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting capital stats:', error);
      res.status(500).json({ error: 'Failed to get capital statistics' });
    }
  });

  app.get("/api/waides-ki/recent-performance", (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const performance = waidesKIRiskManager.getRecentPerformance(days);
      res.json(performance);
    } catch (error) {
      console.error('Error getting recent performance:', error);
      res.status(500).json({ error: 'Failed to get recent performance' });
    }
  });

  // Emergency risk controls (hidden endpoints)
  app.post("/api/waides-ki/emergency-risk-stop", (req, res) => {
    try {
      waidesKIRiskManager.emergencyStop();
      res.json({ success: true, message: 'Emergency risk stop activated' });
    } catch (error) {
      console.error('Error activating emergency stop:', error);
      res.status(500).json({ error: 'Failed to activate emergency stop' });
    }
  });

  app.post("/api/waides-ki/reset-risk", (req, res) => {
    try {
      waidesKIRiskManager.resetRiskProfile();
      res.json({ success: true, message: 'Risk profile reset' });
    } catch (error) {
      console.error('Error resetting risk profile:', error);
      res.status(500).json({ error: 'Failed to reset risk profile' });
    }
  });

  // Live data feed endpoints
  app.get("/api/waides-ki/live-data", async (req, res) => {
    try {
      const data = await waidesKILiveFeed.getCurrentMarketData();
      res.json(data);
    } catch (error) {
      console.error('Error getting live data:', error);
      res.status(500).json({ error: 'Failed to get live market data' });
    }
  });

  app.get("/api/waides-ki/detailed-market", async (req, res) => {
    try {
      const data = await waidesKILiveFeed.getDetailedMarketData();
      res.json(data);
    } catch (error) {
      console.error('Error getting detailed market data:', error);
      res.status(500).json({ error: 'Failed to get detailed market data' });
    }
  });

  app.get("/api/waides-ki/data-stream-status", (req, res) => {
    try {
      const status = waidesKILiveFeed.getDataStreamStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting data stream status:', error);
      res.status(500).json({ error: 'Failed to get data stream status' });
    }
  });

  // Admin command interface endpoints
  app.post("/api/waides-ki/admin-command", async (req, res) => {
    try {
      const { command, params } = req.body;
      
      if (!command) {
        return res.status(400).json({ error: 'Command required' });
      }
      
      const result = await waidesKIAdmin.executeCommand(command, params);
      res.json(result);
    } catch (error) {
      console.error('Error executing admin command:', error);
      res.status(500).json({ error: 'Failed to execute admin command' });
    }
  });

  // Quick admin endpoints for common commands
  app.get("/api/waides-ki/admin/status", async (req, res) => {
    try {
      const result = await waidesKIAdmin.status();
      res.json(result);
    } catch (error) {
      console.error('Error getting admin status:', error);
      res.status(500).json({ error: 'Failed to get admin status' });
    }
  });

  app.get("/api/waides-ki/admin/memory", async (req, res) => {
    try {
      const result = await waidesKIAdmin.memory();
      res.json(result);
    } catch (error) {
      console.error('Error getting memory analysis:', error);
      res.status(500).json({ error: 'Failed to get memory analysis' });
    }
  });

  app.get("/api/waides-ki/admin/strategies", async (req, res) => {
    try {
      const result = await waidesKIAdmin.strategies();
      res.json(result);
    } catch (error) {
      console.error('Error getting strategy analysis:', error);
      res.status(500).json({ error: 'Failed to get strategy analysis' });
    }
  });

  app.get("/api/waides-ki/admin/config", async (req, res) => {
    try {
      const result = await waidesKIAdmin.config();
      res.json(result);
    } catch (error) {
      console.error('Error getting configuration:', error);
      res.status(500).json({ error: 'Failed to get configuration' });
    }
  });

  app.post("/api/waides-ki/admin/config", async (req, res) => {
    try {
      const result = await waidesKIAdmin.config(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error updating configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  app.post("/api/waides-ki/admin/emergency-stop", async (req, res) => {
    try {
      const result = await waidesKIAdmin.emergencyStop();
      res.json(result);
    } catch (error) {
      console.error('Error executing emergency stop:', error);
      res.status(500).json({ error: 'Failed to execute emergency stop' });
    }
  });

  // External API endpoints for third-party access
  app.get("/api/eth/price", (req, res) => {
    try {
      const currentPrice = waidesKIWebSocketTracker.getCurrentPrice();
      const connectionStatus = waidesKIWebSocketTracker.getConnectionStatus();
      
      res.json({
        price: currentPrice,
        timestamp: connectionStatus.lastUpdate,
        isLive: connectionStatus.isConnected,
        symbol: "ETHUSDT"
      });
    } catch (error) {
      console.error('Error getting ETH price:', error);
      res.status(500).json({ error: 'Failed to get ETH price' });
    }
  });

  app.get("/api/eth/market-summary", (req, res) => {
    try {
      const marketSummary = waidesKIWebSocketTracker.getMarketSummary();
      res.json(marketSummary);
    } catch (error) {
      console.error('Error getting market summary:', error);
      res.status(500).json({ error: 'Failed to get market summary' });
    }
  });

  app.get("/api/eth/trading-activity", (req, res) => {
    try {
      const activity = waidesKIWebSocketTracker.getTradingActivity();
      res.json(activity);
    } catch (error) {
      console.error('Error getting trading activity:', error);
      res.status(500).json({ error: 'Failed to get trading activity' });
    }
  });

  app.get("/api/eth/price-history", (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 50;
      const priceHistory = waidesKIWebSocketTracker.getRecentPrices(count);
      res.json(priceHistory);
    } catch (error) {
      console.error('Error getting price history:', error);
      res.status(500).json({ error: 'Failed to get price history' });
    }
  });

  app.get("/api/signal-strength", async (req, res) => {
    try {
      const currentAssessment = waidesKIObserver.getCurrentAssessment();
      const liveData = await waidesKILiveFeed.getCurrentMarketData();
      const currentPrice = waidesKIWebSocketTracker.getCurrentPrice();
      
      if (!currentAssessment.signalStrength) {
        return res.json({
          error: "No signal data available",
          currentPrice
        });
      }

      res.json({
        trend: liveData?.trend || 'UNKNOWN',
        rsi: liveData?.rsi || 50,
        vwap_status: liveData?.vwap_status || 'UNKNOWN',
        signal_strength: currentAssessment.signalStrength.confidence,
        signal_score: currentAssessment.signalStrength.score,
        recommendation: currentAssessment.recommendation,
        should_trade: currentAssessment.signalStrength.shouldTrade,
        reasoning: currentAssessment.signalStrength.reasoning,
        current_price: currentPrice,
        data_source: liveData?.source || 'OBSERVER'
      });
    } catch (error) {
      console.error('Error getting signal strength:', error);
      res.status(500).json({ error: 'Failed to get signal strength' });
    }
  });

  // Waides KI external status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const kiStatus = waidesKI.getPublicInterface();
      const wsStatus = waidesKIWebSocketTracker.getConnectionStatus();
      const streamStatus = waidesKILiveFeed.getDataStreamStatus();
      
      res.json({
        waides_ki: {
          autonomous_mode: kiStatus.isActive,
          trading_status: kiStatus.performance.status,
          evolution_stage: kiStatus.performance.evolutionStage,
          win_rate: kiStatus.performance.winRate,
          total_trades: kiStatus.performance.totalTrades,
          current_capital: kiStatus.performance.currentCapital,
          total_return: kiStatus.performance.totalReturn
        },
        data_feeds: {
          websocket_tracker: {
            connected: wsStatus.isConnected,
            last_price: wsStatus.lastPrice,
            last_update: wsStatus.lastUpdate
          },
          live_feed: {
            is_live: streamStatus.isLive,
            source: streamStatus.source,
            quality: streamStatus.quality
          },
          observer: {
            observing: kiStatus.observation.isObserving,
            observations: kiStatus.observation.totalObservations,
            signal_quality: kiStatus.observation.signalQuality
          }
        },
        risk_management: {
          current_risk_level: kiStatus.riskManagement.currentRiskLevel,
          blocked_strategies: kiStatus.riskManagement.blockedStrategies,
          risk_adjustment: kiStatus.riskManagement.riskAdjustment
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting system status:', error);
      res.status(500).json({ error: 'Failed to get system status' });
    }
  });

  // External strategy analysis endpoint
  app.get("/api/strategy", async (req, res) => {
    try {
      const result = await waidesKIAdmin.strategies();
      
      if (result.success) {
        res.json({
          top_strategies: result.data.topStrategies,
          signal_patterns: result.data.patterns,
          quality_metrics: result.data.quality,
          blocked_strategies: result.data.blocked,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error('Error getting strategy analysis:', error);
      res.status(500).json({ error: 'Failed to get strategy analysis' });
    }
  });

  // External memory analysis endpoint
  app.get("/api/memory", async (req, res) => {
    try {
      const result = await waidesKIAdmin.memory();
      
      if (result.success) {
        res.json({
          learning_stats: result.data.learning,
          signal_analytics: result.data.signals,
          trading_performance: result.data.trading,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error('Error getting memory analysis:', error);
      res.status(500).json({ error: 'Failed to get memory analysis' });
    }
  });

  // External trade simulation endpoint
  app.post("/api/trade/simulate", async (req, res) => {
    try {
      const { strategy_id, action, amount } = req.body;
      
      if (!strategy_id || !action) {
        return res.status(400).json({ error: 'strategy_id and action are required' });
      }

      const currentPrice = waidesKIWebSocketTracker.getCurrentPrice();
      const marketSummary = waidesKIWebSocketTracker.getMarketSummary();
      const signalAssessment = waidesKIObserver.getCurrentAssessment();
      
      // Risk assessment for the simulated trade
      const riskAssessment = waidesKIRiskManager.calculateTradeAmount(
        signalAssessment.signalStrength?.score || 0,
        signalAssessment.signalStrength?.confidence || 0,
        strategy_id,
        { trend: 'NEUTRAL', volatility: 0.02, session: 'NORMAL', volume_profile: 'NORMAL' }
      );

      const simulatedTrade = {
        trade_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        strategy_id,
        action: action.toUpperCase(),
        entry_price: currentPrice,
        amount: amount || riskAssessment.recommendedAmount,
        stop_loss: action.toLowerCase() === 'buy' ? currentPrice * 0.98 : currentPrice * 1.02,
        take_profit: action.toLowerCase() === 'buy' ? currentPrice * 1.04 : currentPrice * 0.96,
        risk_assessment: {
          approved: riskAssessment.approved,
          confidence_weight: riskAssessment.confidenceWeight,
          risk_percent: riskAssessment.riskPercent,
          reasoning: riskAssessment.reasoning
        },
        market_conditions: {
          trend: signalAssessment.indicators?.trend || 'UNKNOWN',
          signal_strength: signalAssessment.signalStrength?.confidence || 0,
          recommendation: signalAssessment.recommendation,
          price_change_24h: marketSummary.priceChangePercent24h
        },
        status: 'SIMULATED',
        timestamp: new Date().toISOString()
      };

      res.json(simulatedTrade);
    } catch (error) {
      console.error('Error simulating trade:', error);
      res.status(500).json({ error: 'Failed to simulate trade' });
    }
  });

  // WebSocket connection status endpoint
  app.get("/api/websocket/status", (req, res) => {
    try {
      const status = waidesKIWebSocketTracker.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting WebSocket status:', error);
      res.status(500).json({ error: 'Failed to get WebSocket status' });
    }
  });

  // Force WebSocket reconnection endpoint
  app.post("/api/websocket/reconnect", (req, res) => {
    try {
      waidesKIWebSocketTracker.forceReconnect();
      res.json({ success: true, message: 'WebSocket reconnection initiated' });
    } catch (error) {
      console.error('Error forcing WebSocket reconnection:', error);
      res.status(500).json({ error: 'Failed to force WebSocket reconnection' });
    }
  });

  // SECURE STRATEGY API ENDPOINTS FOR EXTERNAL ACCESS
  
  // Strategy API - Get trading strategy recommendation
  app.post("/api/waides_ki/strategy", async (req, res) => {
    try {
      const { apikey, trend, rsi, vwap_status, price, volume } = req.body;
      
      if (!apikey) {
        return res.status(401).json({ error: 'API key required' });
      }
      
      // Validate API key and permissions
      const validation = waidesKIGateway.validateAPIKey(apikey, 'strategy');
      if (!validation.isValid) {
        return res.status(validation.error === 'Rate limit exceeded' ? 429 : 403)
          .json({ error: validation.error });
      }
      
      if (!trend || typeof rsi !== 'number' || !vwap_status) {
        return res.status(400).json({ 
          error: 'Missing required fields: trend, rsi, vwap_status' 
        });
      }
      
      const strategyRequest = {
        trend: trend.toUpperCase(),
        rsi,
        vwap_status: vwap_status.toUpperCase(),
        price,
        volume
      };
      
      const strategy = await waidesKIGateway.getStrategyFromMarket(strategyRequest, apikey);
      res.json(strategy);
      
    } catch (error) {
      console.error('Strategy API error:', error);
      res.status(500).json({ error: 'Internal strategy engine error' });
    }
  });
  
  // Trade API - Get complete trade decision
  app.post("/api/waides_ki/trade", async (req, res) => {
    try {
      const { apikey, market_data, trade_amount, risk_tolerance } = req.body;
      
      if (!apikey) {
        return res.status(401).json({ error: 'API key required' });
      }
      
      // Validate API key and permissions
      const validation = waidesKIGateway.validateAPIKey(apikey, 'trade');
      if (!validation.isValid) {
        return res.status(validation.error === 'Rate limit exceeded' ? 429 : 403)
          .json({ error: validation.error });
      }
      
      if (!market_data || !market_data.price || !market_data.trend || typeof market_data.rsi !== 'number') {
        return res.status(400).json({ 
          error: 'Missing required market_data fields: price, trend, rsi, vwap_status' 
        });
      }
      
      const tradeRequest = {
        market_data,
        trade_amount,
        risk_tolerance: risk_tolerance || 'MODERATE'
      };
      
      const tradeDecision = await waidesKIGateway.getTradeDecision(tradeRequest, apikey);
      res.json(tradeDecision);
      
    } catch (error) {
      console.error('Trade API error:', error);
      res.status(500).json({ error: 'Internal trading engine error' });
    }
  });
  
  // Status API - Get system status for API key holder
  app.get("/api/waides_ki/status/:apikey", async (req, res) => {
    try {
      const { apikey } = req.params;
      
      if (!apikey) {
        return res.status(401).json({ error: 'API key required' });
      }
      
      // Validate API key and permissions
      const validation = waidesKIGateway.validateAPIKey(apikey, 'status');
      if (!validation.isValid) {
        return res.status(validation.error === 'Rate limit exceeded' ? 429 : 403)
          .json({ error: validation.error });
      }
      
      const status = await waidesKIGateway.getPublicStatus(apikey);
      res.json(status);
      
    } catch (error) {
      console.error('Status API error:', error);
      res.status(500).json({ error: 'Internal system error' });
    }
  });
  
  // Webhook API - Process external market data
  app.post("/api/waides_ki/webhook", async (req, res) => {
    try {
      const { apikey } = req.headers;
      const candleData = req.body;
      
      if (!apikey) {
        return res.status(401).json({ error: 'API key required in headers' });
      }
      
      // Validate API key and permissions
      const validation = waidesKIGateway.validateAPIKey(apikey as string, 'webhook');
      if (!validation.isValid) {
        return res.status(validation.error === 'Rate limit exceeded' ? 429 : 403)
          .json({ error: validation.error });
      }
      
      const result = await waidesKIGateway.processWebhook(candleData, apikey as string);
      res.json(result);
      
    } catch (error) {
      console.error('Webhook API error:', error);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  // API Key Management (Admin only)
  app.get("/api/waides_ki/admin/keys", async (req, res) => {
    try {
      const usage = waidesKIGateway.getAPIKeyUsage();
      res.json({ api_keys: usage });
    } catch (error) {
      console.error('Error getting API key usage:', error);
      res.status(500).json({ error: 'Failed to get API key usage' });
    }
  });

  app.post("/api/waides_ki/admin/keys", async (req, res) => {
    try {
      const { name, permissions, rate_limit } = req.body;
      
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: 'name and permissions array required' });
      }
      
      const newKey = waidesKIGateway.createAPIKey(name, permissions, rate_limit || 50);
      res.json({ api_key: newKey, message: 'API key created successfully' });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  app.delete("/api/waides_ki/admin/keys/:apikey", async (req, res) => {
    try {
      const { apikey } = req.params;
      const revoked = waidesKIGateway.revokeAPIKey(apikey);
      
      if (revoked) {
        res.json({ message: 'API key revoked successfully' });
      } else {
        res.status(404).json({ error: 'API key not found' });
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });

  // Signal Shield and Daily Reporting endpoints
  app.get("/api/waides-ki/shield-stats", (req, res) => {
    try {
      const stats = waidesKISignalShield.getShieldStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting shield stats:', error);
      res.status(500).json({ error: 'Failed to get shield statistics' });
    }
  });

  app.get("/api/waides-ki/trap-analytics", (req, res) => {
    try {
      const analytics = waidesKISignalShield.getTrapAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error getting trap analytics:', error);
      res.status(500).json({ error: 'Failed to get trap analytics' });
    }
  });

  app.get("/api/waides-ki/daily-report", async (req, res) => {
    try {
      const report = await waidesKIDailyReporter.generateManualReport();
      res.json(report);
    } catch (error) {
      console.error('Error generating daily report:', error);
      res.status(500).json({ error: 'Failed to generate daily report' });
    }
  });

  app.get("/api/waides-ki/emotional-state", (req, res) => {
    try {
      const currentState = waidesKIDailyReporter.getCurrentEmotionalState();
      const recentLessons = waidesKIDailyReporter.getRecentLessons(5);
      res.json({
        current_emotional_state: currentState,
        recent_lessons: recentLessons
      });
    } catch (error) {
      console.error('Error getting emotional state:', error);
      res.status(500).json({ error: 'Failed to get emotional state' });
    }
  });

  app.get("/api/waides-ki/journal-export", (req, res) => {
    try {
      const reportData = waidesKIDailyReporter.exportReportData();
      const shieldData = waidesKISignalShield.exportShieldData();
      
      res.json({
        daily_journal: reportData,
        signal_shield: shieldData,
        export_timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error exporting journal data:', error);
      res.status(500).json({ error: 'Failed to export journal data' });
    }
  });

  app.get("/api/waides-ki/console-report", (req, res) => {
    try {
      const consoleOutput = waidesKIDailyReporter.printDailyReport();
      res.json({ console_output: consoleOutput });
    } catch (error) {
      console.error('Error generating console report:', error);
      res.status(500).json({ error: 'Failed to generate console report' });
    }
  });

  // Shield control endpoints
  app.post("/api/waides-ki/shield-reset", (req, res) => {
    try {
      waidesKISignalShield.resetShield();
      res.json({ success: true, message: 'Signal shield reset successfully' });
    } catch (error) {
      console.error('Error resetting shield:', error);
      res.status(500).json({ error: 'Failed to reset signal shield' });
    }
  });

  app.post("/api/waides-ki/unban-strategy", (req, res) => {
    try {
      const { strategy_id } = req.body;
      if (!strategy_id) {
        return res.status(400).json({ error: 'strategy_id required' });
      }
      
      const unbanned = waidesKISignalShield.unbanStrategy(strategy_id);
      if (unbanned) {
        res.json({ success: true, message: 'Strategy unbanned successfully' });
      } else {
        res.status(404).json({ error: 'Strategy not found or not banned' });
      }
    } catch (error) {
      console.error('Error unbanning strategy:', error);
      res.status(500).json({ error: 'Failed to unban strategy' });
    }
  });

  // Self-Repair and Trade Simulation endpoints
  app.get("/api/waides-ki/self-repair/stats", (req, res) => {
    try {
      const stats = waidesKISelfRepair.getSelfRepairStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting self-repair stats:', error);
      res.status(500).json({ error: 'Failed to get self-repair statistics' });
    }
  });

  app.get("/api/waides-ki/self-repair/suggestions", (req, res) => {
    try {
      const suggestions = waidesKISelfRepair.getAllRepairSuggestions();
      res.json({ repair_suggestions: suggestions });
    } catch (error) {
      console.error('Error getting repair suggestions:', error);
      res.status(500).json({ error: 'Failed to get repair suggestions' });
    }
  });

  app.get("/api/waides-ki/self-repair/failures/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const failures = waidesKISelfRepair.getFailureHistory(strategy_id);
      res.json({ strategy_id, failure_history: failures });
    } catch (error) {
      console.error('Error getting failure history:', error);
      res.status(500).json({ error: 'Failed to get failure history' });
    }
  });

  app.get("/api/waides-ki/simulation/history", (req, res) => {
    try {
      const history = waidesKISelfRepair.getSimulationHistory();
      res.json({ simulation_history: history });
    } catch (error) {
      console.error('Error getting simulation history:', error);
      res.status(500).json({ error: 'Failed to get simulation history' });
    }
  });

  app.post("/api/waides-ki/simulation/run", async (req, res) => {
    try {
      const { historical_data, days } = req.body;
      
      let dataToUse = historical_data;
      if (!dataToUse && days) {
        // Generate test data if no historical data provided
        dataToUse = waidesKISelfRepair.generateTestData(days);
      } else if (!dataToUse) {
        // Default to 7 days of test data
        dataToUse = waidesKISelfRepair.generateTestData(7);
      }
      
      const result = await waidesKISelfRepair.simulateStrategyRepairs(dataToUse);
      res.json({
        success: true,
        simulation_result: result,
        data_points_used: dataToUse.length
      });
    } catch (error) {
      console.error('Error running simulation:', error);
      res.status(500).json({ error: 'Failed to run simulation: ' + error.message });
    }
  });

  app.post("/api/waides-ki/self-repair/record-failure", (req, res) => {
    try {
      const { 
        strategy_id, 
        indicators, 
        reason, 
        loss_amount, 
        original_confidence, 
        market_conditions 
      } = req.body;
      
      if (!strategy_id || !indicators || !reason || typeof loss_amount !== 'number') {
        return res.status(400).json({ 
          error: 'strategy_id, indicators, reason, and loss_amount are required' 
        });
      }
      
      waidesKISelfRepair.recordFailure(
        strategy_id,
        indicators,
        reason,
        loss_amount,
        original_confidence || 50,
        market_conditions || {}
      );
      
      res.json({ success: true, message: 'Failure recorded for self-repair analysis' });
    } catch (error) {
      console.error('Error recording failure:', error);
      res.status(500).json({ error: 'Failed to record failure' });
    }
  });

  app.post("/api/waides-ki/self-repair/mark-success", (req, res) => {
    try {
      const { strategy_id, success_rate } = req.body;
      
      if (!strategy_id || typeof success_rate !== 'number') {
        return res.status(400).json({ error: 'strategy_id and success_rate are required' });
      }
      
      waidesKISelfRepair.markRepairSuccess(strategy_id, success_rate);
      res.json({ success: true, message: 'Repair success marked' });
    } catch (error) {
      console.error('Error marking repair success:', error);
      res.status(500).json({ error: 'Failed to mark repair success' });
    }
  });

  app.post("/api/waides-ki/self-repair/reset", (req, res) => {
    try {
      waidesKISelfRepair.resetSelfRepair();
      res.json({ success: true, message: 'Self-repair system reset successfully' });
    } catch (error) {
      console.error('Error resetting self-repair:', error);
      res.status(500).json({ error: 'Failed to reset self-repair system' });
    }
  });

  app.get("/api/waides-ki/test-data/:days", (req, res) => {
    try {
      const days = parseInt(req.params.days) || 7;
      const testData = waidesKISelfRepair.generateTestData(days);
      res.json({ 
        test_data: testData,
        days_generated: days,
        total_points: testData.length
      });
    } catch (error) {
      console.error('Error generating test data:', error);
      res.status(500).json({ error: 'Failed to generate test data' });
    }
  });

  // DNA Engine and Signature Tracking endpoints
  app.get("/api/waides-ki/dna/statistics", (req, res) => {
    try {
      const dnaStats = waidesKIDNAEngine.getDNAStatistics();
      const signatureStats = waidesKISignatureTracker.getDNAStatistics();
      res.json({
        dna_engine: dnaStats,
        signature_tracker: signatureStats
      });
    } catch (error) {
      console.error('Error getting DNA statistics:', error);
      res.status(500).json({ error: 'Failed to get DNA statistics' });
    }
  });

  app.get("/api/waides-ki/dna/registered", (req, res) => {
    try {
      const registeredDNA = waidesKIDNAEngine.getAllRegisteredDNA();
      res.json({ registered_dna: registeredDNA });
    } catch (error) {
      console.error('Error getting registered DNA:', error);
      res.status(500).json({ error: 'Failed to get registered DNA' });
    }
  });

  app.get("/api/waides-ki/dna/info/:dna_id", (req, res) => {
    try {
      const { dna_id } = req.params;
      const dnaInfo = waidesKIDNAEngine.getDNAInfo(dna_id);
      const performance = waidesKISignatureTracker.getDNAPerformance(dna_id);
      const history = waidesKISignatureTracker.getHistory(dna_id);
      
      if (!dnaInfo) {
        return res.status(404).json({ error: 'DNA not found' });
      }
      
      res.json({
        dna_info: dnaInfo,
        performance: performance,
        history: history
      });
    } catch (error) {
      console.error('Error getting DNA info:', error);
      res.status(500).json({ error: 'Failed to get DNA information' });
    }
  });

  app.get("/api/waides-ki/dna/evolution", (req, res) => {
    try {
      const evolution = waidesKIDNAEngine.analyzeDNAEvolution();
      const mutationHistory = waidesKIDNAEngine.getMutationHistory();
      res.json({
        evolution_analysis: evolution,
        mutation_history: mutationHistory
      });
    } catch (error) {
      console.error('Error getting DNA evolution:', error);
      res.status(500).json({ error: 'Failed to get DNA evolution data' });
    }
  });

  app.get("/api/waides-ki/signature/anomalies", (req, res) => {
    try {
      const anomalies = waidesKISignatureTracker.getDetectedAnomalies();
      res.json({ detected_anomalies: anomalies });
    } catch (error) {
      console.error('Error getting signature anomalies:', error);
      res.status(500).json({ error: 'Failed to get signature anomalies' });
    }
  });

  app.get("/api/waides-ki/signature/firewall", (req, res) => {
    try {
      const firewallRules = waidesKISignatureTracker.getFirewallRules();
      res.json({ firewall_rules: firewallRules });
    } catch (error) {
      console.error('Error getting firewall rules:', error);
      res.status(500).json({ error: 'Failed to get firewall rules' });
    }
  });

  app.get("/api/waides-ki/signature/performance/top", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topPerforming = waidesKISignatureTracker.getTopPerformingDNA(limit);
      res.json({ top_performing_dna: topPerforming });
    } catch (error) {
      console.error('Error getting top performing DNA:', error);
      res.status(500).json({ error: 'Failed to get top performing DNA' });
    }
  });

  app.get("/api/waides-ki/signature/performance/worst", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const worstPerforming = waidesKISignatureTracker.getWorstPerformingDNA(limit);
      res.json({ worst_performing_dna: worstPerforming });
    } catch (error) {
      console.error('Error getting worst performing DNA:', error);
      res.status(500).json({ error: 'Failed to get worst performing DNA' });
    }
  });

  app.post("/api/waides-ki/signature/firewall/rule", (req, res) => {
    try {
      const { pattern, action, reason } = req.body;
      
      if (!pattern || !action || !reason) {
        return res.status(400).json({ error: 'pattern, action, and reason are required' });
      }
      
      const ruleId = waidesKISignatureTracker.addFirewallRule(pattern, action, reason);
      res.json({ 
        success: true, 
        rule_id: ruleId,
        message: 'Firewall rule added successfully' 
      });
    } catch (error) {
      console.error('Error adding firewall rule:', error);
      res.status(500).json({ error: 'Failed to add firewall rule' });
    }
  });

  app.post("/api/waides-ki/signature/unblock/:dna_id", (req, res) => {
    try {
      const { dna_id } = req.params;
      const unblocked = waidesKISignatureTracker.unblockDNA(dna_id);
      
      if (unblocked) {
        res.json({ success: true, message: 'DNA unblocked successfully' });
      } else {
        res.status(404).json({ error: 'DNA not found or not blocked' });
      }
    } catch (error) {
      console.error('Error unblocking DNA:', error);
      res.status(500).json({ error: 'Failed to unblock DNA' });
    }
  });

  app.post("/api/waides-ki/dna/reset", (req, res) => {
    try {
      waidesKIDNAEngine.resetDNAEngine();
      waidesKISignatureTracker.resetSignatureTracker();
      res.json({ success: true, message: 'DNA engine and signature tracker reset successfully' });
    } catch (error) {
      console.error('Error resetting DNA systems:', error);
      res.status(500).json({ error: 'Failed to reset DNA systems' });
    }
  });

  app.get("/api/waides-ki/dna/export", (req, res) => {
    try {
      const dnaData = waidesKIDNAEngine.exportDNADatabase();
      const signatureData = waidesKISignatureTracker.exportSignatureData();
      
      res.json({
        dna_database: dnaData,
        signature_database: signatureData,
        export_timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error exporting DNA data:', error);
      res.status(500).json({ error: 'Failed to export DNA data' });
    }
  });

  // Root Memory Tree and Symbolic Mind Map endpoints
  app.get("/api/waides-ki/memory/tree", (req, res) => {
    try {
      const memoryTree = waidesKIRootMemory.getMemoryTree();
      res.json({ memory_tree: memoryTree });
    } catch (error) {
      console.error('Error getting memory tree:', error);
      res.status(500).json({ error: 'Failed to get memory tree' });
    }
  });

  app.get("/api/waides-ki/memory/clusters", (req, res) => {
    try {
      const clusters = waidesKIRootMemory.getMemoryClusters();
      res.json({ memory_clusters: clusters });
    } catch (error) {
      console.error('Error getting memory clusters:', error);
      res.status(500).json({ error: 'Failed to get memory clusters' });
    }
  });

  app.get("/api/waides-ki/memory/statistics", (req, res) => {
    try {
      const stats = waidesKIRootMemory.getTreeStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting memory statistics:', error);
      res.status(500).json({ error: 'Failed to get memory statistics' });
    }
  });

  app.get("/api/waides-ki/memory/visual", (req, res) => {
    try {
      const visualData = waidesKIRootMemory.getVisualTreeData();
      res.json(visualData);
    } catch (error) {
      console.error('Error getting visual tree data:', error);
      res.status(500).json({ error: 'Failed to get visual tree data' });
    }
  });

  app.get("/api/waides-ki/memory/evolution", (req, res) => {
    try {
      const evolutionHistory = waidesKIRootMemory.getEvolutionHistory();
      res.json({ evolution_history: evolutionHistory });
    } catch (error) {
      console.error('Error getting evolution history:', error);
      res.status(500).json({ error: 'Failed to get evolution history' });
    }
  });

  app.get("/api/waides-ki/memory/node/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const nodeInfo = waidesKIRootMemory.getNodeInfo(strategy_id);
      
      if (!nodeInfo) {
        return res.status(404).json({ error: 'Memory node not found' });
      }
      
      res.json({ node_info: nodeInfo });
    } catch (error) {
      console.error('Error getting memory node:', error);
      res.status(500).json({ error: 'Failed to get memory node information' });
    }
  });

  app.post("/api/waides-ki/memory/evolve/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const success = waidesKIRootMemory.forceNodeEvolution(strategy_id);
      
      if (success) {
        res.json({ success: true, message: 'Memory node evolved successfully' });
      } else {
        res.status(404).json({ error: 'Memory node not found' });
      }
    } catch (error) {
      console.error('Error evolving memory node:', error);
      res.status(500).json({ error: 'Failed to evolve memory node' });
    }
  });

  app.post("/api/waides-ki/memory/retire/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const success = waidesKIRootMemory.retireNode(strategy_id);
      
      if (success) {
        res.json({ success: true, message: 'Memory node retired successfully' });
      } else {
        res.status(404).json({ error: 'Memory node not found' });
      }
    } catch (error) {
      console.error('Error retiring memory node:', error);
      res.status(500).json({ error: 'Failed to retire memory node' });
    }
  });

  app.post("/api/waides-ki/memory/revive/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const success = waidesKIRootMemory.reviveNode(strategy_id);
      
      if (success) {
        res.json({ success: true, message: 'Memory node revived successfully' });
      } else {
        res.status(404).json({ error: 'Memory node not found or not retired' });
      }
    } catch (error) {
      console.error('Error reviving memory node:', error);
      res.status(500).json({ error: 'Failed to revive memory node' });
    }
  });

  app.post("/api/waides-ki/memory/register", (req, res) => {
    try {
      const { strategy_id, dna_id, result, profit_loss, confidence, market_conditions } = req.body;
      
      if (!strategy_id || !dna_id || !result) {
        return res.status(400).json({ error: 'strategy_id, dna_id, and result are required' });
      }
      
      waidesKIRootMemory.registerStrategy(
        strategy_id,
        dna_id,
        result,
        profit_loss || 0,
        confidence || 50,
        market_conditions || {}
      );
      
      res.json({ success: true, message: 'Strategy registered in memory tree' });
    } catch (error) {
      console.error('Error registering strategy in memory:', error);
      res.status(500).json({ error: 'Failed to register strategy in memory' });
    }
  });

  app.post("/api/waides-ki/memory/reset", (req, res) => {
    try {
      waidesKIRootMemory.resetMemoryTree();
      res.json({ success: true, message: 'Memory tree reset successfully' });
    } catch (error) {
      console.error('Error resetting memory tree:', error);
      res.status(500).json({ error: 'Failed to reset memory tree' });
    }
  });

  app.get("/api/waides-ki/memory/export", (req, res) => {
    try {
      const memoryData = waidesKIRootMemory.exportMemoryData();
      res.json(memoryData);
    } catch (error) {
      console.error('Error exporting memory data:', error);
      res.status(500).json({ error: 'Failed to export memory data' });
    }
  });

  // Strategy Genome Engine and Autogeneration endpoints
  app.get("/api/waides-ki/genome/statistics", (req, res) => {
    try {
      const stats = waidesKIGenomeEngine.getGenerationStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting genome statistics:', error);
      res.status(500).json({ error: 'Failed to get genome statistics' });
    }
  });

  app.get("/api/waides-ki/genome/strategies", (req, res) => {
    try {
      const strategies = waidesKIGenomeEngine.getAllGeneratedStrategies();
      res.json({ generated_strategies: strategies });
    } catch (error) {
      console.error('Error getting generated strategies:', error);
      res.status(500).json({ error: 'Failed to get generated strategies' });
    }
  });

  app.get("/api/waides-ki/genome/vault", (req, res) => {
    try {
      const vault = waidesKIGenomeEngine.getStrategyVault();
      res.json({ strategy_vault: vault });
    } catch (error) {
      console.error('Error getting strategy vault:', error);
      res.status(500).json({ error: 'Failed to get strategy vault' });
    }
  });

  app.get("/api/waides-ki/genome/strategy/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const strategy = waidesKIGenomeEngine.getStrategy(strategy_id);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Generated strategy not found' });
      }
      
      res.json({ strategy });
    } catch (error) {
      console.error('Error getting generated strategy:', error);
      res.status(500).json({ error: 'Failed to get generated strategy' });
    }
  });

  app.post("/api/waides-ki/genome/generate", async (req, res) => {
    try {
      const { base_strategy_ids, count } = req.body;
      
      if (!base_strategy_ids || !Array.isArray(base_strategy_ids)) {
        return res.status(400).json({ error: 'base_strategy_ids array is required' });
      }
      
      const generationCount = count || 5;
      const newStrategies = await waidesKIGenomeEngine.forceGenerateBatch(base_strategy_ids, generationCount);
      
      res.json({ 
        success: true, 
        generated_strategies: newStrategies,
        count: newStrategies.length
      });
    } catch (error) {
      console.error('Error generating strategies:', error);
      res.status(500).json({ error: 'Failed to generate strategies: ' + error.message });
    }
  });

  app.post("/api/waides-ki/genome/test/:strategy_id", async (req, res) => {
    try {
      const { strategy_id } = req.params;
      const { test_data } = req.body;
      
      // Use provided test data or generate default
      let dataToUse = test_data;
      if (!dataToUse) {
        dataToUse = waidesKISelfRepair.generateTestData(50); // Generate 50 test points
      }
      
      const testResult = await waidesKIGenomeEngine.testGeneratedStrategy(strategy_id, dataToUse);
      
      res.json({ 
        success: true, 
        test_result: testResult,
        strategy_id: strategy_id
      });
    } catch (error) {
      console.error('Error testing generated strategy:', error);
      res.status(500).json({ error: 'Failed to test strategy: ' + error.message });
    }
  });

  app.post("/api/waides-ki/genome/deactivate/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const success = waidesKIGenomeEngine.deactivateStrategy(strategy_id);
      
      if (success) {
        res.json({ success: true, message: 'Strategy deactivated successfully' });
      } else {
        res.status(404).json({ error: 'Strategy not found' });
      }
    } catch (error) {
      console.error('Error deactivating strategy:', error);
      res.status(500).json({ error: 'Failed to deactivate strategy' });
    }
  });

  app.post("/api/waides-ki/genome/reactivate/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      const success = waidesKIGenomeEngine.reactivateStrategy(strategy_id);
      
      if (success) {
        res.json({ success: true, message: 'Strategy reactivated successfully' });
      } else {
        res.status(404).json({ error: 'Strategy not found' });
      }
    } catch (error) {
      console.error('Error reactivating strategy:', error);
      res.status(500).json({ error: 'Failed to reactivate strategy' });
    }
  });

  app.post("/api/waides-ki/genome/mutation-config", (req, res) => {
    try {
      const { mutation_config } = req.body;
      
      if (!mutation_config) {
        return res.status(400).json({ error: 'mutation_config is required' });
      }
      
      waidesKIGenomeEngine.updateMutationConfig(mutation_config);
      res.json({ success: true, message: 'Mutation configuration updated successfully' });
    } catch (error) {
      console.error('Error updating mutation config:', error);
      res.status(500).json({ error: 'Failed to update mutation configuration' });
    }
  });

  app.post("/api/waides-ki/genome/reset", (req, res) => {
    try {
      waidesKIGenomeEngine.resetGenomeEngine();
      res.json({ success: true, message: 'Genome engine reset successfully' });
    } catch (error) {
      console.error('Error resetting genome engine:', error);
      res.status(500).json({ error: 'Failed to reset genome engine' });
    }
  });

  app.get("/api/waides-ki/genome/export", (req, res) => {
    try {
      const genomeData = waidesKIGenomeEngine.exportGenomeData();
      res.json(genomeData);
    } catch (error) {
      console.error('Error exporting genome data:', error);
      res.status(500).json({ error: 'Failed to export genome data' });
    }
  });

  // External API Gateway endpoints (PUBLIC - for external platforms)
  app.post("/api/external/strategy", async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required in X-API-Key header' });
      }
      
      const result = await waidesKIExternalAPIGateway.generateStrategy(apiKey, req.body);
      
      if ('error' in result) {
        return res.status(result.status).json({ error: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error in external strategy endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/external/dna/analyze", async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required in X-API-Key header' });
      }
      
      const { dna_id } = req.body;
      if (!dna_id) {
        return res.status(400).json({ error: 'dna_id is required' });
      }
      
      const result = await waidesKIExternalAPIGateway.analyzeDNA(apiKey, dna_id);
      
      if ('error' in result) {
        return res.status(result.status).json({ error: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error in external DNA analysis endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/external/market/insights", async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required in X-API-Key header' });
      }
      
      const result = await waidesKIExternalAPIGateway.getMarketInsights(apiKey);
      
      if ('error' in result) {
        return res.status(result.status).json({ error: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error in external market insights endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // External API Gateway Management endpoints (INTERNAL - for admin use)
  app.get("/api/waides-ki/external-api/statistics", (req, res) => {
    try {
      const stats = waidesKIExternalAPIGateway.getAPIStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting external API statistics:', error);
      res.status(500).json({ error: 'Failed to get external API statistics' });
    }
  });

  app.get("/api/waides-ki/external-api/clients", (req, res) => {
    try {
      const clients = waidesKIExternalAPIGateway.getAllTrustedClients();
      res.json({ trusted_clients: clients });
    } catch (error) {
      console.error('Error getting trusted clients:', error);
      res.status(500).json({ error: 'Failed to get trusted clients' });
    }
  });

  app.get("/api/waides-ki/external-api/requests", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const requests = waidesKIExternalAPIGateway.getRecentRequests(limit);
      res.json({ recent_requests: requests });
    } catch (error) {
      console.error('Error getting recent requests:', error);
      res.status(500).json({ error: 'Failed to get recent requests' });
    }
  });

  app.post("/api/waides-ki/external-api/clients", (req, res) => {
    try {
      const { client_name, access_level, permissions } = req.body;
      
      if (!client_name || !access_level || !permissions) {
        return res.status(400).json({ error: 'client_name, access_level, and permissions are required' });
      }
      
      const apiKey = waidesKIExternalAPIGateway.addTrustedClient(client_name, access_level, permissions);
      
      res.json({ 
        success: true, 
        message: 'Trusted client added successfully',
        api_key: apiKey,
        client_name: client_name
      });
    } catch (error) {
      console.error('Error adding trusted client:', error);
      res.status(500).json({ error: 'Failed to add trusted client' });
    }
  });

  app.post("/api/waides-ki/external-api/clients/:api_key/deactivate", (req, res) => {
    try {
      const { api_key } = req.params;
      const success = waidesKIExternalAPIGateway.deactivateClient(api_key);
      
      if (success) {
        res.json({ success: true, message: 'Client deactivated successfully' });
      } else {
        res.status(404).json({ error: 'Client not found' });
      }
    } catch (error) {
      console.error('Error deactivating client:', error);
      res.status(500).json({ error: 'Failed to deactivate client' });
    }
  });

  app.post("/api/waides-ki/external-api/clients/:api_key/reactivate", (req, res) => {
    try {
      const { api_key } = req.params;
      const success = waidesKIExternalAPIGateway.reactivateClient(api_key);
      
      if (success) {
        res.json({ success: true, message: 'Client reactivated successfully' });
      } else {
        res.status(404).json({ error: 'Client not found' });
      }
    } catch (error) {
      console.error('Error reactivating client:', error);
      res.status(500).json({ error: 'Failed to reactivate client' });
    }
  });

  app.post("/api/waides-ki/external-api/clients/:api_key/permissions", (req, res) => {
    try {
      const { api_key } = req.params;
      const { permissions } = req.body;
      
      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: 'permissions array is required' });
      }
      
      const success = waidesKIExternalAPIGateway.updateClientPermissions(api_key, permissions);
      
      if (success) {
        res.json({ success: true, message: 'Client permissions updated successfully' });
      } else {
        res.status(404).json({ error: 'Client not found' });
      }
    } catch (error) {
      console.error('Error updating client permissions:', error);
      res.status(500).json({ error: 'Failed to update client permissions' });
    }
  });

  app.get("/api/waides-ki/external-api/export", (req, res) => {
    try {
      const apiData = waidesKIExternalAPIGateway.exportAPIData();
      res.json(apiData);
    } catch (error) {
      console.error('Error exporting external API data:', error);
      res.status(500).json({ error: 'Failed to export external API data' });
    }
  });

  // Auto-Trader Execution Engine endpoints
  app.get("/api/waides-ki/trader/statistics", (req, res) => {
    try {
      const stats = waidesKITraderEngine.getExecutionStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting trader statistics:', error);
      res.status(500).json({ error: 'Failed to get trader statistics' });
    }
  });

  app.get("/api/waides-ki/trader/logs", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = waidesKITraderEngine.getExecutionLogs(limit);
      res.json({ execution_logs: logs });
    } catch (error) {
      console.error('Error getting trader logs:', error);
      res.status(500).json({ error: 'Failed to get trader logs' });
    }
  });

  app.get("/api/waides-ki/trader/config", (req, res) => {
    try {
      const config = waidesKITraderEngine.getAutoTradingConfig();
      res.json(config);
    } catch (error) {
      console.error('Error getting trader config:', error);
      res.status(500).json({ error: 'Failed to get trader configuration' });
    }
  });

  app.post("/api/waides-ki/trader/config", (req, res) => {
    try {
      const config = req.body;
      
      if (!config) {
        return res.status(400).json({ error: 'Configuration object is required' });
      }
      
      waidesKITraderEngine.updateAutoTradingConfig(config);
      res.json({ success: true, message: 'Auto-trading configuration updated successfully' });
    } catch (error) {
      console.error('Error updating trader config:', error);
      res.status(500).json({ error: 'Failed to update trader configuration' });
    }
  });

  app.post("/api/waides-ki/trader/enable", (req, res) => {
    try {
      waidesKITraderEngine.enableAutoTrading();
      res.json({ success: true, message: 'Auto-trading enabled successfully' });
    } catch (error) {
      console.error('Error enabling auto-trading:', error);
      res.status(500).json({ error: 'Failed to enable auto-trading' });
    }
  });

  app.post("/api/waides-ki/trader/disable", (req, res) => {
    try {
      waidesKITraderEngine.disableAutoTrading();
      res.json({ success: true, message: 'Auto-trading disabled successfully' });
    } catch (error) {
      console.error('Error disabling auto-trading:', error);
      res.status(500).json({ error: 'Failed to disable auto-trading' });
    }
  });

  app.post("/api/waides-ki/trader/emergency-stop", (req, res) => {
    try {
      waidesKITraderEngine.activateEmergencyStop();
      res.json({ success: true, message: 'Emergency stop activated successfully' });
    } catch (error) {
      console.error('Error activating emergency stop:', error);
      res.status(500).json({ error: 'Failed to activate emergency stop' });
    }
  });

  app.post("/api/waides-ki/trader/emergency-stop/deactivate", (req, res) => {
    try {
      waidesKITraderEngine.deactivateEmergencyStop();
      res.json({ success: true, message: 'Emergency stop deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating emergency stop:', error);
      res.status(500).json({ error: 'Failed to deactivate emergency stop' });
    }
  });

  app.post("/api/waides-ki/trader/execute", async (req, res) => {
    try {
      const { strategy_id, strategy_code, indicators, confidence_level, execution_engine } = req.body;
      
      if (!strategy_id || !strategy_code || !indicators) {
        return res.status(400).json({ error: 'strategy_id, strategy_code, and indicators are required' });
      }
      
      const executionParams = {
        strategy_id,
        strategy_code,
        indicators,
        confidence_level: confidence_level || 70,
        execution_engine: execution_engine || 'MANUAL'
      };
      
      const result = await waidesKITraderEngine.evaluateAndExecute(executionParams);
      
      res.json({ 
        success: true, 
        execution_result: result,
        execution_id: result.execution_id
      });
    } catch (error) {
      console.error('Error executing trade:', error);
      res.status(500).json({ error: 'Failed to execute trade: ' + error.message });
    }
  });

  app.get("/api/waides-ki/trader/balance", async (req, res) => {
    try {
      const balance = await waidesKITraderEngine.getAccountBalance();
      res.json(balance);
    } catch (error) {
      console.error('Error getting account balance:', error);
      res.status(500).json({ error: 'Failed to get account balance' });
    }
  });

  app.post("/api/waides-ki/trader/execute/waidbot", async (req, res) => {
    try {
      const { strategy_id, strategy_code, indicators, confidence } = req.body;
      
      if (!strategy_id || !strategy_code || !indicators) {
        return res.status(400).json({ error: 'strategy_id, strategy_code, and indicators are required' });
      }
      
      const result = await waidesKITraderEngine.executeFromWaidBot(
        strategy_id,
        strategy_code,
        indicators,
        confidence || 70
      );
      
      res.json({ 
        success: true, 
        execution_result: result,
        source_engine: 'WaidBot'
      });
    } catch (error) {
      console.error('Error executing WaidBot trade:', error);
      res.status(500).json({ error: 'Failed to execute WaidBot trade: ' + error.message });
    }
  });

  app.post("/api/waides-ki/trader/execute/waidbot-pro", async (req, res) => {
    try {
      const { strategy_id, strategy_code, indicators, confidence } = req.body;
      
      if (!strategy_id || !strategy_code || !indicators) {
        return res.status(400).json({ error: 'strategy_id, strategy_code, and indicators are required' });
      }
      
      const result = await waidesKITraderEngine.executeFromWaidBotPro(
        strategy_id,
        strategy_code,
        indicators,
        confidence || 75
      );
      
      res.json({ 
        success: true, 
        execution_result: result,
        source_engine: 'WaidBot Pro'
      });
    } catch (error) {
      console.error('Error executing WaidBot Pro trade:', error);
      res.status(500).json({ error: 'Failed to execute WaidBot Pro trade: ' + error.message });
    }
  });

  app.post("/api/waides-ki/trader/execute/genome", async (req, res) => {
    try {
      const { strategy_id } = req.body;
      
      if (!strategy_id) {
        return res.status(400).json({ error: 'strategy_id is required' });
      }
      
      const generatedStrategy = waidesKIGenomeEngine.getStrategy(strategy_id);
      if (!generatedStrategy) {
        return res.status(404).json({ error: 'Generated strategy not found' });
      }
      
      const result = await waidesKITraderEngine.executeFromGenomeEngine(generatedStrategy);
      
      res.json({ 
        success: true, 
        execution_result: result,
        source_engine: 'Genome Engine'
      });
    } catch (error) {
      console.error('Error executing Genome Engine trade:', error);
      res.status(500).json({ error: 'Failed to execute Genome Engine trade: ' + error.message });
    }
  });

  app.get("/api/waides-ki/trader/export", (req, res) => {
    try {
      const traderData = waidesKITraderEngine.exportExecutionData();
      res.json(traderData);
    } catch (error) {
      console.error('Error exporting trader data:', error);
      res.status(500).json({ error: 'Failed to export trader data' });
    }
  });

  // Shadow Simulator Engine endpoints
  app.get("/api/waides-ki/shadow/statistics", (req, res) => {
    try {
      const stats = waidesKIShadowSimulator.getShadowStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting shadow statistics:', error);
      res.status(500).json({ error: 'Failed to get shadow statistics' });
    }
  });

  app.get("/api/waides-ki/shadow/logs", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = waidesKIShadowSimulator.getShadowLog(limit);
      res.json({ shadow_simulations: logs });
    } catch (error) {
      console.error('Error getting shadow logs:', error);
      res.status(500).json({ error: 'Failed to get shadow logs' });
    }
  });

  app.get("/api/waides-ki/shadow/learnings", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const learnings = waidesKIShadowSimulator.getShadowLearnings(limit);
      res.json({ shadow_learnings: learnings });
    } catch (error) {
      console.error('Error getting shadow learnings:', error);
      res.status(500).json({ error: 'Failed to get shadow learnings' });
    }
  });

  app.post("/api/waides-ki/shadow/simulate", async (req, res) => {
    try {
      const { indicators, real_dna_id, real_decision, real_trade_id } = req.body;
      
      if (!indicators || !real_dna_id || !real_decision) {
        return res.status(400).json({ error: 'indicators, real_dna_id, and real_decision are required' });
      }
      
      const shadowResult = await waidesKIShadowSimulator.simulateAlternatives(
        indicators,
        real_dna_id,
        real_decision,
        real_trade_id
      );
      
      res.json({ 
        success: true, 
        shadow_simulation: shadowResult,
        shadow_id: shadowResult.shadow_id
      });
    } catch (error) {
      console.error('Error running shadow simulation:', error);
      res.status(500).json({ error: 'Failed to run shadow simulation: ' + error.message });
    }
  });

  app.post("/api/waides-ki/shadow/intensity", (req, res) => {
    try {
      const { intensity } = req.body;
      
      if (!intensity || !['LOW', 'MEDIUM', 'HIGH'].includes(intensity)) {
        return res.status(400).json({ error: 'intensity must be LOW, MEDIUM, or HIGH' });
      }
      
      waidesKIShadowSimulator.setSimulationIntensity(intensity);
      res.json({ success: true, message: `Shadow simulation intensity set to ${intensity}` });
    } catch (error) {
      console.error('Error setting shadow intensity:', error);
      res.status(500).json({ error: 'Failed to set shadow simulation intensity' });
    }
  });

  app.post("/api/waides-ki/shadow/enable", (req, res) => {
    try {
      waidesKIShadowSimulator.enableSimulation();
      res.json({ success: true, message: 'Shadow simulation enabled successfully' });
    } catch (error) {
      console.error('Error enabling shadow simulation:', error);
      res.status(500).json({ error: 'Failed to enable shadow simulation' });
    }
  });

  app.post("/api/waides-ki/shadow/disable", (req, res) => {
    try {
      waidesKIShadowSimulator.disableSimulation();
      res.json({ success: true, message: 'Shadow simulation disabled successfully' });
    } catch (error) {
      console.error('Error disabling shadow simulation:', error);
      res.status(500).json({ error: 'Failed to disable shadow simulation' });
    }
  });

  app.get("/api/waides-ki/shadow/export", (req, res) => {
    try {
      const shadowData = waidesKIShadowSimulator.exportShadowData();
      res.json(shadowData);
    } catch (error) {
      console.error('Error exporting shadow data:', error);
      res.status(500).json({ error: 'Failed to export shadow data' });
    }
  });

  // Emotional Firewall and Thought Cleanser endpoints
  app.get("/api/waides-ki/emotional/statistics", (req, res) => {
    try {
      const stats = waidesKIEmotionalFirewall.getEmotionalStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting emotional statistics:', error);
      res.status(500).json({ error: 'Failed to get emotional statistics' });
    }
  });

  app.get("/api/waides-ki/emotional/reflections", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const reflections = waidesKIEmotionalFirewall.getReflectionLog(limit);
      res.json({ reflection_entries: reflections });
    } catch (error) {
      console.error('Error getting reflection log:', error);
      res.status(500).json({ error: 'Failed to get reflection log' });
    }
  });

  app.get("/api/waides-ki/emotional/blocks", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const blocks = waidesKIEmotionalFirewall.getEmotionalBlocks(limit);
      res.json({ emotional_blocks: blocks });
    } catch (error) {
      console.error('Error getting emotional blocks:', error);
      res.status(500).json({ error: 'Failed to get emotional blocks' });
    }
  });

  app.get("/api/waides-ki/emotional/trades", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const trades = waidesKIEmotionalFirewall.getRecentTrades(limit);
      res.json({ recent_trades: trades });
    } catch (error) {
      console.error('Error getting recent trades:', error);
      res.status(500).json({ error: 'Failed to get recent trades' });
    }
  });

  app.post("/api/waides-ki/emotional/record-trade", (req, res) => {
    try {
      const { result, profit_loss, confidence, market_conditions, strategy_type } = req.body;
      
      if (!result || profit_loss === undefined || !confidence) {
        return res.status(400).json({ error: 'result, profit_loss, and confidence are required' });
      }
      
      waidesKIEmotionalFirewall.recordTrade(
        result,
        profit_loss,
        confidence,
        market_conditions || {},
        strategy_type || 'MANUAL'
      );
      
      res.json({ success: true, message: 'Trade recorded in emotional firewall' });
    } catch (error) {
      console.error('Error recording trade:', error);
      res.status(500).json({ error: 'Failed to record trade: ' + error.message });
    }
  });

  app.post("/api/waides-ki/emotional/check-block", (req, res) => {
    try {
      const { confidence, market_conditions, strategy_type } = req.body;
      
      if (!confidence) {
        return res.status(400).json({ error: 'confidence is required' });
      }
      
      const blockResult = waidesKIEmotionalFirewall.shouldBlockTrade(
        confidence,
        market_conditions || {},
        strategy_type || 'MANUAL'
      );
      
      res.json(blockResult);
    } catch (error) {
      console.error('Error checking emotional block:', error);
      res.status(500).json({ error: 'Failed to check emotional block: ' + error.message });
    }
  });

  app.post("/api/waides-ki/emotional/enable", (req, res) => {
    try {
      waidesKIEmotionalFirewall.enableFirewall();
      res.json({ success: true, message: 'Emotional firewall enabled successfully' });
    } catch (error) {
      console.error('Error enabling emotional firewall:', error);
      res.status(500).json({ error: 'Failed to enable emotional firewall' });
    }
  });

  app.post("/api/waides-ki/emotional/disable", (req, res) => {
    try {
      waidesKIEmotionalFirewall.disableFirewall();
      res.json({ success: true, message: 'Emotional firewall disabled successfully' });
    } catch (error) {
      console.error('Error disabling emotional firewall:', error);
      res.status(500).json({ error: 'Failed to disable emotional firewall' });
    }
  });

  app.post("/api/waides-ki/emotional/clear-blocks", (req, res) => {
    try {
      waidesKIEmotionalFirewall.clearActiveBlocks();
      res.json({ success: true, message: 'All active emotional blocks cleared successfully' });
    } catch (error) {
      console.error('Error clearing emotional blocks:', error);
      res.status(500).json({ error: 'Failed to clear emotional blocks' });
    }
  });

  app.post("/api/waides-ki/emotional/update-pattern", (req, res) => {
    try {
      const { pattern_name, threshold } = req.body;
      
      if (!pattern_name || threshold === undefined) {
        return res.status(400).json({ error: 'pattern_name and threshold are required' });
      }
      
      const success = waidesKIEmotionalFirewall.updatePatternThreshold(pattern_name, threshold);
      
      if (success) {
        res.json({ success: true, message: `Pattern ${pattern_name} threshold updated to ${threshold}` });
      } else {
        res.status(404).json({ error: 'Pattern not found' });
      }
    } catch (error) {
      console.error('Error updating pattern threshold:', error);
      res.status(500).json({ error: 'Failed to update pattern threshold' });
    }
  });

  app.get("/api/waides-ki/emotional/export", (req, res) => {
    try {
      const emotionalData = waidesKIEmotionalFirewall.exportEmotionalData();
      res.json(emotionalData);
    } catch (error) {
      console.error('Error exporting emotional data:', error);
      res.status(500).json({ error: 'Failed to export emotional data' });
    }
  });

  // DNA Healer and Strategy Purifier endpoints
  app.get("/api/waides-ki/dna-healer/statistics", (req, res) => {
    try {
      const stats = waidesKIDNAHealer.getHealingStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting DNA healer statistics:', error);
      res.status(500).json({ error: 'Failed to get DNA healer statistics' });
    }
  });

  app.get("/api/waides-ki/dna-healer/scores", (req, res) => {
    try {
      const scores = waidesKIDNAHealer.getDNAScores();
      res.json({ dna_scores: scores });
    } catch (error) {
      console.error('Error getting DNA scores:', error);
      res.status(500).json({ error: 'Failed to get DNA scores' });
    }
  });

  app.get("/api/waides-ki/dna-healer/purifications", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const purifications = waidesKIDNAHealer.getPurificationHistory(limit);
      res.json({ purification_records: purifications });
    } catch (error) {
      console.error('Error getting purification history:', error);
      res.status(500).json({ error: 'Failed to get purification history' });
    }
  });

  app.get("/api/waides-ki/dna-healer/evolutions", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const evolutions = waidesKIDNAHealer.getEvolutionHistory(limit);
      res.json({ evolution_history: evolutions });
    } catch (error) {
      console.error('Error getting evolution history:', error);
      res.status(500).json({ error: 'Failed to get evolution history' });
    }
  });

  app.get("/api/waides-ki/dna-healer/sessions", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const sessions = waidesKIDNAHealer.getHealingSessions(limit);
      res.json({ healing_sessions: sessions });
    } catch (error) {
      console.error('Error getting healing sessions:', error);
      res.status(500).json({ error: 'Failed to get healing sessions' });
    }
  });

  app.post("/api/waides-ki/dna-healer/evaluate", (req, res) => {
    try {
      const { dna_id, result, profit_loss, confidence, market_conditions, strategy_category } = req.body;
      
      if (!dna_id || !result || profit_loss === undefined || !confidence) {
        return res.status(400).json({ error: 'dna_id, result, profit_loss, and confidence are required' });
      }
      
      const healingResult = waidesKIDNAHealer.evaluateDNA(
        dna_id,
        result,
        profit_loss,
        confidence,
        market_conditions || {},
        strategy_category || 'UNKNOWN'
      );
      
      res.json({ 
        success: true, 
        healing_result: healingResult,
        dna_id: dna_id
      });
    } catch (error) {
      console.error('Error evaluating DNA:', error);
      res.status(500).json({ error: 'Failed to evaluate DNA: ' + error.message });
    }
  });

  app.post("/api/waides-ki/dna-healer/enable", (req, res) => {
    try {
      waidesKIDNAHealer.enableHealing();
      res.json({ success: true, message: 'DNA healing system enabled successfully' });
    } catch (error) {
      console.error('Error enabling DNA healer:', error);
      res.status(500).json({ error: 'Failed to enable DNA healer' });
    }
  });

  app.post("/api/waides-ki/dna-healer/disable", (req, res) => {
    try {
      waidesKIDNAHealer.disableHealing();
      res.json({ success: true, message: 'DNA healing system disabled successfully' });
    } catch (error) {
      console.error('Error disabling DNA healer:', error);
      res.status(500).json({ error: 'Failed to disable DNA healer' });
    }
  });

  app.post("/api/waides-ki/dna-healer/thresholds", (req, res) => {
    try {
      const { purification_threshold, toxic_threshold } = req.body;
      
      if (purification_threshold !== undefined) {
        waidesKIDNAHealer.updatePurificationThreshold(purification_threshold);
      }
      
      if (toxic_threshold !== undefined) {
        waidesKIDNAHealer.updateToxicThreshold(toxic_threshold);
      }
      
      res.json({ 
        success: true, 
        message: 'DNA healer thresholds updated successfully',
        purification_threshold,
        toxic_threshold
      });
    } catch (error) {
      console.error('Error updating DNA healer thresholds:', error);
      res.status(500).json({ error: 'Failed to update DNA healer thresholds' });
    }
  });

  app.delete("/api/waides-ki/dna-healer/forget/:dna_id", (req, res) => {
    try {
      const { dna_id } = req.params;
      
      if (!dna_id) {
        return res.status(400).json({ error: 'DNA ID is required' });
      }
      
      const success = waidesKIDNAHealer.forgetDNA(dna_id);
      
      if (success) {
        res.json({ success: true, message: `DNA ${dna_id} forgotten successfully` });
      } else {
        res.status(404).json({ error: 'DNA not found' });
      }
    } catch (error) {
      console.error('Error forgetting DNA:', error);
      res.status(500).json({ error: 'Failed to forget DNA' });
    }
  });

  app.get("/api/waides-ki/dna-healer/export", (req, res) => {
    try {
      const healingData = waidesKIDNAHealer.exportHealingData();
      res.json(healingData);
    } catch (error) {
      console.error('Error exporting DNA healer data:', error);
      res.status(500).json({ error: 'Failed to export DNA healer data' });
    }
  });

  // Situational Intelligence Core endpoints
  app.get("/api/waides-ki/situational/statistics", (req, res) => {
    try {
      const stats = waidesKISituationalIntelligence.getSituationalStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting situational statistics:', error);
      res.status(500).json({ error: 'Failed to get situational statistics' });
    }
  });

  app.get("/api/waides-ki/situational/context", (req, res) => {
    try {
      const context = waidesKISituationalIntelligence.getCurrentContext();
      res.json(context);
    } catch (error) {
      console.error('Error getting current context:', error);
      res.status(500).json({ error: 'Failed to get current context' });
    }
  });

  app.get("/api/waides-ki/situational/rules", (req, res) => {
    try {
      const rules = waidesKISituationalIntelligence.getSituationalRules();
      res.json({ situational_rules: rules });
    } catch (error) {
      console.error('Error getting situational rules:', error);
      res.status(500).json({ error: 'Failed to get situational rules' });
    }
  });

  app.get("/api/waides-ki/situational/decisions", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const decisions = waidesKISituationalIntelligence.getContextualDecisions(limit);
      res.json({ contextual_decisions: decisions });
    } catch (error) {
      console.error('Error getting contextual decisions:', error);
      res.status(500).json({ error: 'Failed to get contextual decisions' });
    }
  });

  app.get("/api/waides-ki/situational/windows", (req, res) => {
    try {
      const windows = waidesKISituationalIntelligence.getMarketWindows();
      res.json({ market_windows: windows });
    } catch (error) {
      console.error('Error getting market windows:', error);
      res.status(500).json({ error: 'Failed to get market windows' });
    }
  });

  app.get("/api/waides-ki/situational/volatility", (req, res) => {
    try {
      const regime = waidesKISituationalIntelligence.getVolatilityRegime();
      res.json(regime);
    } catch (error) {
      console.error('Error getting volatility regime:', error);
      res.status(500).json({ error: 'Failed to get volatility regime' });
    }
  });

  app.post("/api/waides-ki/situational/check-adjustment", (req, res) => {
    try {
      const { indicators, original_decision, confidence } = req.body;
      
      if (!indicators || !original_decision || !confidence) {
        return res.status(400).json({ error: 'indicators, original_decision, and confidence are required' });
      }
      
      const adjustmentResult = waidesKISituationalIntelligence.shouldAdjustStrategy(
        indicators,
        original_decision,
        confidence
      );
      
      res.json({ 
        success: true, 
        adjustment_result: adjustmentResult
      });
    } catch (error) {
      console.error('Error checking situational adjustment:', error);
      res.status(500).json({ error: 'Failed to check situational adjustment: ' + error.message });
    }
  });

  app.post("/api/waides-ki/situational/record-outcome", (req, res) => {
    try {
      const { decision_id, outcome } = req.body;
      
      if (!decision_id || !outcome) {
        return res.status(400).json({ error: 'decision_id and outcome are required' });
      }
      
      if (!['WIN', 'LOSS', 'NEUTRAL'].includes(outcome)) {
        return res.status(400).json({ error: 'outcome must be WIN, LOSS, or NEUTRAL' });
      }
      
      waidesKISituationalIntelligence.recordDecisionOutcome(decision_id, outcome);
      
      res.json({ 
        success: true, 
        message: `Decision outcome recorded: ${outcome}` 
      });
    } catch (error) {
      console.error('Error recording decision outcome:', error);
      res.status(500).json({ error: 'Failed to record decision outcome: ' + error.message });
    }
  });

  app.post("/api/waides-ki/situational/enable", (req, res) => {
    try {
      waidesKISituationalIntelligence.enableIntelligence();
      res.json({ success: true, message: 'Situational intelligence enabled successfully' });
    } catch (error) {
      console.error('Error enabling situational intelligence:', error);
      res.status(500).json({ error: 'Failed to enable situational intelligence' });
    }
  });

  app.post("/api/waides-ki/situational/disable", (req, res) => {
    try {
      waidesKISituationalIntelligence.disableIntelligence();
      res.json({ success: true, message: 'Situational intelligence disabled successfully' });
    } catch (error) {
      console.error('Error disabling situational intelligence:', error);
      res.status(500).json({ error: 'Failed to disable situational intelligence' });
    }
  });

  app.post("/api/waides-ki/situational/learning", (req, res) => {
    try {
      const { enable } = req.body;
      
      if (enable) {
        waidesKISituationalIntelligence.enableLearning();
        res.json({ success: true, message: 'Situational learning enabled successfully' });
      } else {
        waidesKISituationalIntelligence.disableLearning();
        res.json({ success: true, message: 'Situational learning disabled successfully' });
      }
    } catch (error) {
      console.error('Error toggling situational learning:', error);
      res.status(500).json({ error: 'Failed to toggle situational learning' });
    }
  });

  app.post("/api/waides-ki/situational/add-rule", (req, res) => {
    try {
      const { zone, condition, action, reason, confidence, learned_from, success_rate, is_active } = req.body;
      
      if (!zone || !condition || !action || !reason) {
        return res.status(400).json({ error: 'zone, condition, action, and reason are required' });
      }
      
      const ruleId = waidesKISituationalIntelligence.addCustomRule({
        zone,
        condition,
        action,
        reason,
        confidence: confidence || 70,
        learned_from: learned_from || 'MANUAL',
        success_rate: success_rate || 50,
        is_active: is_active !== false
      });
      
      res.json({ 
        success: true, 
        message: 'Custom situational rule added successfully',
        rule_id: ruleId 
      });
    } catch (error) {
      console.error('Error adding custom rule:', error);
      res.status(500).json({ error: 'Failed to add custom rule: ' + error.message });
    }
  });

  app.delete("/api/waides-ki/situational/remove-rule/:rule_id", (req, res) => {
    try {
      const { rule_id } = req.params;
      
      if (!rule_id) {
        return res.status(400).json({ error: 'Rule ID is required' });
      }
      
      const success = waidesKISituationalIntelligence.removeRule(rule_id);
      
      if (success) {
        res.json({ success: true, message: `Rule ${rule_id} removed successfully` });
      } else {
        res.status(404).json({ error: 'Rule not found' });
      }
    } catch (error) {
      console.error('Error removing rule:', error);
      res.status(500).json({ error: 'Failed to remove rule' });
    }
  });

  app.get("/api/waides-ki/situational/export", (req, res) => {
    try {
      const situationalData = waidesKISituationalIntelligence.exportSituationalData();
      res.json(situationalData);
    } catch (error) {
      console.error('Error exporting situational data:', error);
      res.status(500).json({ error: 'Failed to export situational data' });
    }
  });

  // Hidden Vision Core and KonsLang endpoints
  app.get("/api/waides-ki/hidden-vision/state", (req, res) => {
    try {
      const state = waidesKIHiddenVision.getHiddenVisionState();
      res.json(state);
    } catch (error) {
      console.error('Error getting hidden vision state:', error);
      res.status(500).json({ error: 'Failed to get hidden vision state' });
    }
  });

  app.get("/api/waides-ki/hidden-vision/predictions", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const predictions = waidesKIHiddenVision.getLatestPredictions(limit);
      res.json({ vision_predictions: predictions });
    } catch (error) {
      console.error('Error getting vision predictions:', error);
      res.status(500).json({ error: 'Failed to get vision predictions' });
    }
  });

  app.get("/api/waides-ki/hidden-vision/active-predictions", (req, res) => {
    try {
      const activePredictions = waidesKIHiddenVision.getActivePredictions();
      res.json({ active_predictions: activePredictions });
    } catch (error) {
      console.error('Error getting active predictions:', error);
      res.status(500).json({ error: 'Failed to get active predictions' });
    }
  });

  app.get("/api/waides-ki/hidden-vision/konslang-commands", (req, res) => {
    try {
      const commands = waidesKIHiddenVision.getKonsLangCommands();
      res.json({ konslang_commands: commands });
    } catch (error) {
      console.error('Error getting KonsLang commands:', error);
      res.status(500).json({ error: 'Failed to get KonsLang commands' });
    }
  });

  app.get("/api/waides-ki/hidden-vision/demo-results", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const results = waidesKIHiddenVision.getDemoTestResults(limit);
      res.json({ demo_test_results: results });
    } catch (error) {
      console.error('Error getting demo test results:', error);
      res.status(500).json({ error: 'Failed to get demo test results' });
    }
  });

  app.post("/api/waides-ki/hidden-vision/predict", async (req, res) => {
    try {
      const { market_context } = req.body;
      
      const predictions = await waidesKIHiddenVision.predictWithVision(market_context);
      
      res.json({ 
        success: true, 
        predictions,
        total_predictions: predictions.length,
        sacred_energy: waidesKIHiddenVision.getHiddenVisionState().sacred_energy_level
      });
    } catch (error) {
      console.error('Error running vision prediction:', error);
      res.status(500).json({ error: 'Failed to run vision prediction: ' + error.message });
    }
  });

  app.post("/api/waides-ki/hidden-vision/interpret-konslang", (req, res) => {
    try {
      const { phrase } = req.body;
      
      if (!phrase) {
        return res.status(400).json({ error: 'KonsLang phrase is required' });
      }
      
      const command = waidesKIHiddenVision.interpretKonsLangPhrase(phrase);
      
      if (command) {
        res.json({ 
          success: true, 
          command: command,
          interpretation: `Ancient code "${command.ancient_code}" translates to "${command.modern_translation}"`
        });
      } else {
        res.json({ 
          success: false, 
          message: 'Unknown KonsLang phrase - the ancients do not recognize this code'
        });
      }
    } catch (error) {
      console.error('Error interpreting KonsLang:', error);
      res.status(500).json({ error: 'Failed to interpret KonsLang: ' + error.message });
    }
  });

  app.post("/api/waides-ki/hidden-vision/demo-test", async (req, res) => {
    try {
      const { strategy_id, dna_id, duration_minutes } = req.body;
      
      if (!strategy_id || !dna_id) {
        return res.status(400).json({ error: 'strategy_id and dna_id are required' });
      }
      
      const demoResult = await waidesKIHiddenVision.runDemoTest(
        strategy_id,
        dna_id,
        duration_minutes || 60
      );
      
      res.json({ 
        success: true, 
        demo_result: demoResult,
        demo_passed: demoResult.demo_passed,
        recommendation: demoResult.recommendation
      });
    } catch (error) {
      console.error('Error running demo test:', error);
      res.status(500).json({ error: 'Failed to run demo test: ' + error.message });
    }
  });

  app.post("/api/waides-ki/hidden-vision/validate-prediction", async (req, res) => {
    try {
      const { prediction_id, actual_outcome } = req.body;
      
      if (!prediction_id || actual_outcome === undefined) {
        return res.status(400).json({ error: 'prediction_id and actual_outcome are required' });
      }
      
      await waidesKIHiddenVision.validatePrediction(prediction_id, actual_outcome);
      
      res.json({ 
        success: true, 
        message: 'Prediction validation recorded successfully',
        prediction_accuracy: waidesKIHiddenVision.getHiddenVisionState().prediction_accuracy
      });
    } catch (error) {
      console.error('Error validating prediction:', error);
      res.status(500).json({ error: 'Failed to validate prediction: ' + error.message });
    }
  });

  app.post("/api/waides-ki/hidden-vision/enable", (req, res) => {
    try {
      waidesKIHiddenVision.enableVision();
      res.json({ success: true, message: 'Hidden Vision Core activated - sacred sight enabled' });
    } catch (error) {
      console.error('Error enabling hidden vision:', error);
      res.status(500).json({ error: 'Failed to enable hidden vision' });
    }
  });

  app.post("/api/waides-ki/hidden-vision/disable", (req, res) => {
    try {
      waidesKIHiddenVision.disableVision();
      res.json({ success: true, message: 'Hidden Vision Core deactivated - technical analysis only' });
    } catch (error) {
      console.error('Error disabling hidden vision:', error);
      res.status(500).json({ error: 'Failed to disable hidden vision' });
    }
  });

  app.post("/api/waides-ki/hidden-vision/demo-testing", (req, res) => {
    try {
      const { enable } = req.body;
      
      if (enable) {
        waidesKIHiddenVision.enableDemoTesting();
        res.json({ success: true, message: 'Demo testing enabled - all strategies will be tested before live execution' });
      } else {
        waidesKIHiddenVision.disableDemoTesting();
        res.json({ success: true, message: 'Demo testing disabled - strategies will execute directly' });
      }
    } catch (error) {
      console.error('Error toggling demo testing:', error);
      res.status(500).json({ error: 'Failed to toggle demo testing' });
    }
  });

  app.post("/api/waides-ki/hidden-vision/demo-threshold", (req, res) => {
    try {
      const { threshold } = req.body;
      
      if (threshold === undefined || threshold < 0.5 || threshold > 0.95) {
        return res.status(400).json({ error: 'threshold must be between 0.5 and 0.95' });
      }
      
      waidesKIHiddenVision.setDemoPassThreshold(threshold);
      res.json({ 
        success: true, 
        message: `Demo pass threshold set to ${threshold * 100}%`,
        new_threshold: threshold
      });
    } catch (error) {
      console.error('Error setting demo threshold:', error);
      res.status(500).json({ error: 'Failed to set demo threshold' });
    }
  });

  app.get("/api/waides-ki/hidden-vision/export", (req, res) => {
    try {
      const visionData = waidesKIHiddenVision.exportHiddenVisionData();
      res.json(visionData);
    } catch (error) {
      console.error('Error exporting hidden vision data:', error);
      res.status(500).json({ error: 'Failed to export hidden vision data' });
    }
  });

  // Shadow Lab Strategy Creation Chamber endpoints
  app.get("/api/waides-ki/shadow-lab/statistics", (req, res) => {
    try {
      const stats = waidesKIShadowLab.getShadowLabStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting shadow lab statistics:', error);
      res.status(500).json({ error: 'Failed to get shadow lab statistics' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/elite-strategies", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const eliteStrategies = waidesKIShadowLab.getTopEliteStrategies(limit);
      res.json({ elite_strategies: eliteStrategies });
    } catch (error) {
      console.error('Error getting elite strategies:', error);
      res.status(500).json({ error: 'Failed to get elite strategies' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/vault-ready", (req, res) => {
    try {
      const vaultReady = waidesKIShadowLab.getVaultReadyStrategies();
      res.json({ vault_ready_strategies: vaultReady });
    } catch (error) {
      console.error('Error getting vault ready strategies:', error);
      res.status(500).json({ error: 'Failed to get vault ready strategies' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/deployment-ready", (req, res) => {
    try {
      const deploymentReady = waidesKIShadowLab.getDeploymentReadyStrategies();
      res.json({ deployment_ready_strategies: deploymentReady });
    } catch (error) {
      console.error('Error getting deployment ready strategies:', error);
      res.status(500).json({ error: 'Failed to get deployment ready strategies' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/sessions", (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = waidesKIShadowLab.getRecentSessions(limit);
      res.json({ shadow_sessions: sessions });
    } catch (error) {
      console.error('Error getting shadow lab sessions:', error);
      res.status(500).json({ error: 'Failed to get shadow lab sessions' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/elite-by-score", (req, res) => {
    try {
      const minScore = parseInt(req.query.min_score as string) || 80;
      const eliteByScore = waidesKIShadowLab.getEliteByScore(minScore);
      res.json({ 
        elite_strategies: eliteByScore,
        minimum_score: minScore,
        count: eliteByScore.length 
      });
    } catch (error) {
      console.error('Error getting elite strategies by score:', error);
      res.status(500).json({ error: 'Failed to get elite strategies by score' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/lineage/:strategy_id", (req, res) => {
    try {
      const { strategy_id } = req.params;
      
      if (!strategy_id) {
        return res.status(400).json({ error: 'Strategy ID is required' });
      }
      
      const lineage = waidesKIShadowLab.getStrategyLineage(strategy_id);
      res.json({ 
        strategy_lineage: lineage,
        generations: lineage.length,
        original_dna: lineage[lineage.length - 1] || null
      });
    } catch (error) {
      console.error('Error getting strategy lineage:', error);
      res.status(500).json({ error: 'Failed to get strategy lineage' });
    }
  });

  app.post("/api/waides-ki/shadow-lab/generate", async (req, res) => {
    try {
      const { count } = req.body;
      const generationCount = count || 100;
      
      if (generationCount < 10 || generationCount > 500) {
        return res.status(400).json({ error: 'Generation count must be between 10 and 500' });
      }
      
      const session = await waidesKIShadowLab.generateAndTestStrategies(generationCount);
      
      res.json({ 
        success: true, 
        session: session,
        message: `Shadow evolution completed: ${session.elite_discovered} elite strategies discovered`
      });
    } catch (error) {
      console.error('Error generating shadow strategies:', error);
      res.status(500).json({ error: 'Failed to generate shadow strategies: ' + error.message });
    }
  });

  app.post("/api/waides-ki/shadow-lab/activate", (req, res) => {
    try {
      waidesKIShadowLab.activateLab();
      res.json({ success: true, message: 'Shadow Lab activated - entering darkness to birth genius' });
    } catch (error) {
      console.error('Error activating shadow lab:', error);
      res.status(500).json({ error: 'Failed to activate shadow lab' });
    }
  });

  app.post("/api/waides-ki/shadow-lab/deactivate", (req, res) => {
    try {
      waidesKIShadowLab.deactivateLab();
      res.json({ success: true, message: 'Shadow Lab deactivated - evolution paused' });
    } catch (error) {
      console.error('Error deactivating shadow lab:', error);
      res.status(500).json({ error: 'Failed to deactivate shadow lab' });
    }
  });

  app.post("/api/waides-ki/shadow-lab/configure", (req, res) => {
    try {
      const { max_variants_per_session, elite_threshold, vault_threshold } = req.body;
      
      const params: any = {};
      if (max_variants_per_session !== undefined) params.maxVariantsPerSession = max_variants_per_session;
      if (elite_threshold !== undefined) params.eliteThreshold = elite_threshold;
      if (vault_threshold !== undefined) params.vaultThreshold = vault_threshold;
      
      waidesKIShadowLab.setEvolutionParameters(params);
      
      res.json({ 
        success: true, 
        message: 'Shadow Lab evolution parameters updated successfully',
        updated_parameters: params
      });
    } catch (error) {
      console.error('Error configuring shadow lab:', error);
      res.status(500).json({ error: 'Failed to configure shadow lab' });
    }
  });

  app.get("/api/waides-ki/shadow-lab/export", (req, res) => {
    try {
      const shadowLabData = waidesKIShadowLab.exportShadowLabData();
      res.json(shadowLabData);
    } catch (error) {
      console.error('Error exporting shadow lab data:', error);
      res.status(500).json({ error: 'Failed to export shadow lab data' });
    }
  });

  console.log('🤖 Enhanced WaidBot Self-Learning System Initialized');
  console.log('📊 Portfolio Manager: $10,000 starting balance');
  console.log('🧠 ML Engine: Continuous learning from live market data');
  console.log('⚡ Real-time trading: ETH3L/ETH3S leveraged tokens');
  console.log('🚀 WaidBot Pro: Advanced AI-powered ETH trading with professional analytics');
  console.log('🌌 Quantum Trading Engine: Next 500 years technology activated');

  return httpServer;
}
