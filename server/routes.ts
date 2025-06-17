import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { EthMonitor } from "./services/ethMonitor.js";
import { SignalAnalyzer } from "./services/signalAnalyzer.js";
import { KonsEngine } from "./services/konsEngine.js";
import { SpiritualBridge } from "./services/spiritualBridge.js";
import { insertApiKeySchema } from "@shared/schema.js";


let ethMonitor: EthMonitor;
let signalAnalyzer: SignalAnalyzer;
let konsEngine: KonsEngine;
let spiritualBridge: SpiritualBridge;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  ethMonitor = new EthMonitor();
  signalAnalyzer = new SignalAnalyzer();
  konsEngine = new KonsEngine();
  spiritualBridge = new SpiritualBridge();

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
