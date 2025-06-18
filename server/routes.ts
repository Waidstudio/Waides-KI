import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { EthMonitor } from "./services/ethMonitor.js";
import { SignalAnalyzer } from "./services/signalAnalyzer.js";
import { KonsEngine } from "./services/konsEngine.js";
import { SpiritualBridge } from "./services/spiritualBridge.js";
import { DivineCommLayer } from "./services/divineCommLayer.js";
import { PionexTrader } from "./services/pionexTrader.js";
import { BinanceWebSocketService, type CandlestickData } from "./services/binanceWebSocket.js";
import { insertApiKeySchema } from "@shared/schema.js";


let ethMonitor: EthMonitor;
let signalAnalyzer: SignalAnalyzer;
let konsEngine: KonsEngine;
let spiritualBridge: SpiritualBridge;
let divineCommLayer: DivineCommLayer;
let pionexTrader: PionexTrader;
let binanceWS: BinanceWebSocketService;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  ethMonitor = new EthMonitor();
  signalAnalyzer = new SignalAnalyzer();
  konsEngine = new KonsEngine();
  spiritualBridge = new SpiritualBridge();
  divineCommLayer = new DivineCommLayer();
  pionexTrader = new PionexTrader();
  binanceWS = new BinanceWebSocketService();

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
      if (!pionexTrader.isConfigured()) {
        return res.status(400).json({ 
          error: 'Pionex API keys not configured',
          message: 'Please set PIONEX_API_KEY and PIONEX_SECRET_KEY in environment'
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
      const tradeResult = await pionexTrader.executeKonsTrade(
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

  // Get Pionex Account Status
  app.get("/api/pionex-status", async (req, res) => {
    try {
      if (!pionexTrader.isConfigured()) {
        return res.json({
          configured: false,
          message: 'Pionex API keys not configured'
        });
      }

      const balance = await pionexTrader.getAccountBalance();
      res.json({
        configured: true,
        balance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Pionex status error:', error);
      res.status(500).json({ error: 'Failed to get Pionex status' });
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

  // Store data every 30 seconds for real-time updates
  setInterval(async () => {
    try {
      const ethData = await ethMonitor.fetchEthData();
      const fearGreedIndex = await ethMonitor.fetchFearGreedIndex();
      
      // Store the data
      await storage.createEthData({
        price: ethData.price,
        volume: ethData.volume || null,
        marketCap: ethData.marketCap || null,
        priceChange24h: ethData.priceChange24h || null
      });
    } catch (error) {
      console.error('Background data update error:', error);
    }
  }, 30000);

  return httpServer;
}
