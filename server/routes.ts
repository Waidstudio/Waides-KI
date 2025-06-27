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
      const response = await konsaiEngine.processMessage(message);
      
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

  return Promise.resolve(server);
}