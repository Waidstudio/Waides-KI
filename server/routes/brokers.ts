/**
 * Broker Management API Routes
 * Endpoints for connecting and managing broker integrations
 */

import type { Express } from 'express';
import { brokerManager, type BrokerType, type BrokerConfig, type TradeRequest } from '../services/brokerIntegrationManager.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

export function registerBrokerRoutes(app: Express): void {
  
  // ==================== BROKER CONFIGURATION ====================

  /**
   * POST /api/brokers/register
   * Register a broker configuration for the user
   */
  app.post('/api/brokers/register', requireAuth, async (req, res) => {
    try {
      const { brokerType, apiToken, apiKey, apiSecret, appId, accountId, serverUrl } = req.body;
      
      if (!brokerType) {
        return res.status(400).json({
          success: false,
          message: 'brokerType is required'
        });
      }

      const config: BrokerConfig = {
        type: brokerType,
        apiToken,
        apiKey,
        apiSecret,
        appId,
        accountId,
        serverUrl
      };

      brokerManager.registerBroker(config);

      res.json({
        success: true,
        message: `Broker ${brokerType} registered successfully`
      });
    } catch (error) {
      console.error('Error registering broker:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register broker'
      });
    }
  });

  /**
   * POST /api/brokers/connect
   * Connect to a registered broker
   */
  app.post('/api/brokers/connect', requireAuth, async (req, res) => {
    try {
      const { brokerType } = req.body;
      
      if (!brokerType) {
        return res.status(400).json({
          success: false,
          message: 'brokerType is required'
        });
      }

      const result = await brokerManager.connectBroker(brokerType);

      res.json({
        success: result.success,
        message: result.success ? `Connected to ${brokerType}` : result.error
      });
    } catch (error) {
      console.error('Error connecting to broker:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to connect to broker'
      });
    }
  });

  /**
   * POST /api/brokers/disconnect
   * Disconnect from a broker
   */
  app.post('/api/brokers/disconnect', requireAuth, async (req, res) => {
    try {
      const { brokerType } = req.body;
      
      if (!brokerType) {
        return res.status(400).json({
          success: false,
          message: 'brokerType is required'
        });
      }

      await brokerManager.disconnectBroker(brokerType);

      res.json({
        success: true,
        message: `Disconnected from ${brokerType}`
      });
    } catch (error) {
      console.error('Error disconnecting from broker:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect from broker'
      });
    }
  });

  /**
   * GET /api/brokers/status
   * Get status of all registered brokers
   */
  app.get('/api/brokers/status', requireAuth, async (req, res) => {
    try {
      const statuses = brokerManager.getAllBrokerStatuses();

      res.json({
        success: true,
        brokers: statuses
      });
    } catch (error) {
      console.error('Error getting broker status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get broker status'
      });
    }
  });

  /**
   * GET /api/brokers/status/:brokerType
   * Get status of a specific broker
   */
  app.get('/api/brokers/status/:brokerType', requireAuth, async (req, res) => {
    try {
      const { brokerType } = req.params;
      const status = brokerManager.getBrokerStatus(brokerType as BrokerType);

      res.json({
        success: true,
        broker: status
      });
    } catch (error) {
      console.error('Error getting broker status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get broker status'
      });
    }
  });

  // ==================== TRADING ====================

  /**
   * POST /api/brokers/trade
   * Execute a trade on a connected broker
   */
  app.post('/api/brokers/trade', requireAuth, async (req, res) => {
    try {
      const { broker, symbol, direction, amount, duration, durationType, leverage, stopLoss, takeProfit } = req.body;
      
      if (!broker || !symbol || !direction || !amount) {
        return res.status(400).json({
          success: false,
          message: 'broker, symbol, direction, and amount are required'
        });
      }

      const tradeRequest: TradeRequest = {
        broker,
        symbol,
        direction,
        amount,
        duration,
        durationType,
        leverage,
        stopLoss,
        takeProfit
      };

      const result = await brokerManager.executeTrade(tradeRequest);

      res.json({
        success: result.success,
        orderId: result.orderId,
        brokerOrderId: result.brokerOrderId,
        entryPrice: result.entryPrice,
        profit: result.profit,
        error: result.error,
        timestamp: result.timestamp
      });
    } catch (error) {
      console.error('Error executing trade:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute trade'
      });
    }
  });

  /**
   * GET /api/brokers/quote/:brokerType/:symbol
   * Get current market quote
   */
  app.get('/api/brokers/quote/:brokerType/:symbol', requireAuth, async (req, res) => {
    try {
      const { brokerType, symbol } = req.params;
      
      const quote = await brokerManager.getQuote(brokerType as BrokerType, symbol);

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: 'Quote not available'
        });
      }

      res.json({
        success: true,
        quote
      });
    } catch (error) {
      console.error('Error getting quote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get quote'
      });
    }
  });

  /**
   * GET /api/brokers/positions/:brokerType
   * Get open positions from a broker
   */
  app.get('/api/brokers/positions/:brokerType', requireAuth, async (req, res) => {
    try {
      const { brokerType } = req.params;
      
      const positions = await brokerManager.getOpenPositions(brokerType as BrokerType);

      res.json({
        success: true,
        positions
      });
    } catch (error) {
      console.error('Error getting positions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get positions'
      });
    }
  });

  /**
   * POST /api/brokers/positions/:brokerType/close
   * Close an open position
   */
  app.post('/api/brokers/positions/:brokerType/close', requireAuth, async (req, res) => {
    try {
      const { brokerType } = req.params;
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId is required'
        });
      }

      const result = await brokerManager.closePosition(brokerType as BrokerType, orderId);

      res.json({
        success: result.success,
        error: result.error,
        timestamp: result.timestamp
      });
    } catch (error) {
      console.error('Error closing position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to close position'
      });
    }
  });

  /**
   * GET /api/brokers/balance/:brokerType
   * Get account balance from a broker
   */
  app.get('/api/brokers/balance/:brokerType', requireAuth, async (req, res) => {
    try {
      const { brokerType } = req.params;
      
      const balance = await brokerManager.getBalance(brokerType as BrokerType);

      if (!balance) {
        return res.status(404).json({
          success: false,
          message: 'Balance not available'
        });
      }

      res.json({
        success: true,
        balance: balance.balance,
        currency: balance.currency
      });
    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get balance'
      });
    }
  });

  // ==================== MARKET DATA ====================

  /**
   * GET /api/brokers/markets/:marketType
   * Get available brokers for a market type
   */
  app.get('/api/brokers/markets/:marketType', async (req, res) => {
    try {
      const { marketType } = req.params;
      
      const brokers = brokerManager.getBrokersByMarketType(marketType);

      res.json({
        success: true,
        marketType,
        brokers
      });
    } catch (error) {
      console.error('Error getting market brokers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get market brokers'
      });
    }
  });

  /**
   * POST /api/brokers/subscribe
   * Subscribe to real-time quotes
   */
  app.post('/api/brokers/subscribe', requireAuth, async (req, res) => {
    try {
      const { brokerType, symbol } = req.body;
      
      if (!brokerType || !symbol) {
        return res.status(400).json({
          success: false,
          message: 'brokerType and symbol are required'
        });
      }

      // Set up subscription callback
      brokerManager.subscribeToQuotes(brokerType as BrokerType, symbol, (quote) => {
        // This would typically emit to WebSocket
        console.log(`📊 Quote update: ${symbol} bid:${quote.bid} ask:${quote.ask}`);
      });

      res.json({
        success: true,
        message: `Subscribed to ${symbol} on ${brokerType}`
      });
    } catch (error) {
      console.error('Error subscribing to quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to quotes'
      });
    }
  });

  /**
   * POST /api/brokers/unsubscribe
   * Unsubscribe from real-time quotes
   */
  app.post('/api/brokers/unsubscribe', requireAuth, async (req, res) => {
    try {
      const { brokerType, symbol } = req.body;
      
      if (!brokerType || !symbol) {
        return res.status(400).json({
          success: false,
          message: 'brokerType and symbol are required'
        });
      }

      brokerManager.unsubscribeFromQuotes(brokerType as BrokerType, symbol);

      res.json({
        success: true,
        message: `Unsubscribed from ${symbol} on ${brokerType}`
      });
    } catch (error) {
      console.error('Error unsubscribing from quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe from quotes'
      });
    }
  });

  // ==================== ADMIN ====================

  /**
   * GET /api/admin/brokers
   * Get all broker configurations (admin only)
   */
  app.get('/api/admin/brokers', requireAuth, requireAdmin, async (req, res) => {
    try {
      const statuses = brokerManager.getAllBrokerStatuses();

      res.json({
        success: true,
        brokers: statuses
      });
    } catch (error) {
      console.error('Error getting admin broker info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get broker info'
      });
    }
  });

  /**
   * POST /api/admin/brokers/disconnect-all
   * Disconnect all brokers (admin only)
   */
  app.post('/api/admin/brokers/disconnect-all', requireAuth, requireAdmin, async (req, res) => {
    try {
      await brokerManager.disconnectAll();

      res.json({
        success: true,
        message: 'All brokers disconnected'
      });
    } catch (error) {
      console.error('Error disconnecting all brokers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect brokers'
      });
    }
  });

  console.log('✅ Broker routes registered');
}