import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { EthMonitor } from "./services/ethMonitor.js";
import { SignalAnalyzer } from "./services/signalAnalyzer.js";
import { KonsEngine } from "./services/konsEngine.js";
import { insertApiKeySchema } from "@shared/schema.js";
import { WebSocketServer } from 'ws';

let ethMonitor: EthMonitor;
let signalAnalyzer: SignalAnalyzer;
let konsEngine: KonsEngine;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  ethMonitor = new EthMonitor();
  signalAnalyzer = new SignalAnalyzer();
  konsEngine = new KonsEngine();

  // Get current ETH data and signals
  app.get("/api/eth", async (req, res) => {
    try {
      const ethData = await ethMonitor.fetchEthData();
      const fearGreedIndex = await ethMonitor.fetchFearGreedIndex();
      
      // Store the data
      await storage.createEthData({
        price: ethData.price,
        volume: ethData.volume,
        marketCap: ethData.marketCap,
        priceChange24h: ethData.priceChange24h
      });
      
      // Analyze signal
      signalAnalyzer.updatePriceHistory(ethData);
      const signal = signalAnalyzer.analyzeSignal(ethData, fearGreedIndex);
      
      // Generate Kons message
      const konsMessage = konsEngine.generateKonsMessage(signal.type, signal.confidence, ethData.price);
      
      // Deactivate old signals and create new one
      await storage.deactivateSignals();
      await storage.createSignal({
        type: signal.type,
        confidence: signal.confidence,
        entryPoint: signal.entryPoint,
        targetPrice: signal.targetPrice,
        stopLoss: signal.stopLoss,
        description: signal.description,
        konsMessage,
        isActive: true
      });
      
      res.json({
        ethData: {
          ...ethData,
          fearGreedIndex
        },
        signal: {
          ...signal,
          konsMessage
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

  const httpServer = createServer(app);

  // WebSocket for real-time updates
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast updates every 30 seconds
  setInterval(async () => {
    try {
      const ethData = await ethMonitor.fetchEthData();
      const fearGreedIndex = await ethMonitor.fetchFearGreedIndex();
      
      // Store the data
      await storage.createEthData({
        price: ethData.price,
        volume: ethData.volume,
        marketCap: ethData.marketCap,
        priceChange24h: ethData.priceChange24h
      });
      
      const updateData = {
        type: 'eth_update',
        data: { ...ethData, fearGreedIndex }
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(updateData));
        }
      });
    } catch (error) {
      console.error('WebSocket update error:', error);
    }
  }, 30000);

  return httpServer;
}
