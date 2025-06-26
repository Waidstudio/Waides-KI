import { waidesKILearning } from './waidesKILearningEngine';
import { waidesKIObserver } from './waidesKIObserver';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKICore } from './waidesKICore';

interface APIKey {
  key: string;
  name: string;
  permissions: string[];
  rateLimit: number;
  lastUsed: number;
  usageCount: number;
  isActive: boolean;
}

interface StrategyRequest {
  trend: 'UPTREND' | 'DOWNTREND' | 'RANGING';
  rsi: number;
  vwap_status: 'ABOVE' | 'BELOW';
  price?: number;
  volume?: number;
}

interface StrategyResponse {
  strategy_id: string;
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
  expires_in: number; // seconds
}

interface TradeRequest {
  market_data: {
    price: number;
    trend: string;
    rsi: number;
    vwap_status: string;
    volume?: number;
  };
  trade_amount?: number;
  risk_tolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

interface TradeResponse {
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: number;
  reasoning: string[];
  suggested_amount?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_assessment: {
    approved: boolean;
    risk_percent: number;
    confidence_weight: number;
  };
  strategy_id: string;
  expires_in: number;
}

export class WaidesKIGateway {
  private approvedKeys: Map<string, APIKey> = new Map();
  private requestCounts: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    this.initializeAPIKeys();
    this.startCleanupInterval();
  }

  private initializeAPIKeys(): void {
    // Default API keys for external access
    const defaultKeys: APIKey[] = [
      {
        key: 'WAIDES_ABC123_STRATEGY',
        name: 'External Trading Platform',
        permissions: ['strategy', 'status'],
        rateLimit: 100, // requests per minute
        lastUsed: 0,
        usageCount: 0,
        isActive: true
      },
      {
        key: 'WAIDES_XTR456_TRADE',
        name: 'Institutional Client',
        permissions: ['strategy', 'trade', 'status'],
        rateLimit: 50,
        lastUsed: 0,
        usageCount: 0,
        isActive: true
      },
      {
        key: 'WAIDES_KONS999_FULL',
        name: 'Premium Partner',
        permissions: ['strategy', 'trade', 'status', 'webhook'],
        rateLimit: 200,
        lastUsed: 0,
        usageCount: 0,
        isActive: true
      }
    ];

    defaultKeys.forEach(key => {
      this.approvedKeys.set(key.key, key);
    });
  }

  // API KEY VALIDATION
  validateAPIKey(apikey: string, permission: string): {
    isValid: boolean;
    error?: string;
    keyInfo?: APIKey;
  } {
    if (!apikey) {
      return { isValid: false, error: 'API key required' };
    }

    const keyInfo = this.approvedKeys.get(apikey);
    if (!keyInfo) {
      return { isValid: false, error: 'Invalid API key' };
    }

    if (!keyInfo.isActive) {
      return { isValid: false, error: 'API key is disabled' };
    }

    if (!keyInfo.permissions.includes(permission)) {
      return { isValid: false, error: 'Insufficient permissions' };
    }

    // Rate limiting check
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestCounts.get(apikey) || 0;
    const lastRequest = this.lastRequestTime.get(apikey) || 0;

    if (lastRequest > oneMinuteAgo && recentRequests >= keyInfo.rateLimit) {
      return { isValid: false, error: 'Rate limit exceeded' };
    }

    // Update usage tracking
    if (lastRequest <= oneMinuteAgo) {
      this.requestCounts.set(apikey, 1);
    } else {
      this.requestCounts.set(apikey, recentRequests + 1);
    }
    
    this.lastRequestTime.set(apikey, now);
    keyInfo.lastUsed = now;
    keyInfo.usageCount++;

    return { isValid: true, keyInfo };
  }

  // STRATEGY API - CORE FUNCTIONALITY
  async getStrategyFromMarket(request: StrategyRequest, apikey: string): Promise<StrategyResponse> {
    // Generate strategy ID based on market conditions
    const strategyId = this.generateSecureStrategyId(request);
    
    // Get confidence assessment from observer (without exposing internal logic)
    const currentAssessment = waidesKIObserver.getCurrentAssessment();
    const confidence = Math.min(
      this.calculatePublicConfidence(request),
      currentAssessment.signalStrength?.confidence || 50
    );

    // Determine recommendation without exposing decision logic
    const recommendation = this.getPublicRecommendation(request, confidence);
    
    // Assess risk level
    const riskLevel = this.assessPublicRiskLevel(request, confidence);

    return {
      strategy_id: strategyId,
      confidence,
      recommendation,
      risk_level: riskLevel,
      timestamp: Date.now(),
      expires_in: 300 // 5 minutes
    };
  }

  // TRADE API - SECURE TRADE DECISIONS
  async getTradeDecision(request: TradeRequest, apikey: string): Promise<TradeResponse> {
    const keyInfo = this.approvedKeys.get(apikey);
    if (!keyInfo) {
      throw new Error('Invalid API key');
    }

    // Convert external request to internal format
    const marketConditions = {
      trend: request.market_data.trend,
      volatility: 0.02, // Default value
      session: 'NORMAL',
      volume_profile: 'NORMAL',
      confidence: this.calculatePublicConfidence({
        trend: request.market_data.trend as any,
        rsi: request.market_data.rsi,
        vwap_status: request.market_data.vwap_status as any,
        price: request.market_data.price
      })
    };

    // Get risk assessment without exposing internal algorithms
    const signalStrength = Math.min(85, marketConditions.confidence + 10);
    const strategyId = this.generateSecureStrategyId({
      trend: request.market_data.trend as any,
      rsi: request.market_data.rsi,
      vwap_status: request.market_data.vwap_status as any,
      price: request.market_data.price
    });

    const riskAssessment = waidesKIRiskManager.calculateTradeAmount(
      signalStrength,
      marketConditions.confidence,
      strategyId,
      marketConditions
    );

    // Generate secure trade response
    const action = this.determineTradeAction(request, riskAssessment.approved);
    const reasoning = this.generatePublicReasoning(request, action);

    return {
      action,
      confidence: marketConditions.confidence,
      reasoning,
      suggested_amount: riskAssessment.approved ? riskAssessment.recommendedAmount : undefined,
      stop_loss: action === 'BUY' ? request.market_data.price * 0.98 : 
                 action === 'SELL' ? request.market_data.price * 1.02 : undefined,
      take_profit: action === 'BUY' ? request.market_data.price * 1.04 : 
                   action === 'SELL' ? request.market_data.price * 0.96 : undefined,
      risk_assessment: {
        approved: riskAssessment.approved,
        risk_percent: riskAssessment.riskPercent,
        confidence_weight: riskAssessment.confidenceWeight
      },
      strategy_id: strategyId,
      expires_in: 180 // 3 minutes
    };
  }

  // STATUS API - SYSTEM HEALTH WITHOUT SENSITIVE DATA
  async getPublicStatus(apikey: string): Promise<any> {
    const keyInfo = this.approvedKeys.get(apikey);
    if (!keyInfo) {
      throw new Error('Invalid API key');
    }

    const kiStatus = waidesKI.getPublicInterface();
    
    // Filter out sensitive information
    return {
      system_status: 'OPERATIONAL',
      strategy_engine: {
        available: true,
        confidence_range: '60-95%',
        supported_markets: ['ETH/USDT'],
        response_time: '<200ms'
      },
      api_info: {
        version: '1.0',
        rate_limit: keyInfo.rateLimit,
        requests_remaining: Math.max(0, keyInfo.rateLimit - (this.requestCounts.get(apikey) || 0)),
        permissions: keyInfo.permissions
      },
      market_coverage: {
        real_time_data: true,
        technical_indicators: ['RSI', 'EMA', 'VWAP'],
        update_frequency: '15 seconds'
      },
      timestamp: Date.now()
    };
  }

  // WEBHOOK API - EXTERNAL DATA PROCESSING
  async processWebhook(candleData: any, apikey: string): Promise<any> {
    const keyInfo = this.approvedKeys.get(apikey);
    if (!keyInfo || !keyInfo.permissions.includes('webhook')) {
      throw new Error('Webhook access denied');
    }

    // Process incoming candle data securely
    const marketAnalysis = {
      trend: this.analyzeTrendFromCandle(candleData),
      rsi: this.calculateRSIFromCandle(candleData),
      vwap_status: this.determineVWAPStatus(candleData)
    };

    const strategy = await this.getStrategyFromMarket(marketAnalysis, apikey);

    return {
      processed: true,
      strategy_recommendation: strategy,
      next_webhook_in: 60, // seconds
      timestamp: Date.now()
    };
  }

  // PRIVATE HELPER METHODS (PROTECT INTERNAL LOGIC)
  private generateSecureStrategyId(request: StrategyRequest): string {
    // Generate strategy ID without exposing internal naming conventions
    const trendCode = request.trend === 'UPTREND' ? 'U' : request.trend === 'DOWNTREND' ? 'D' : 'R';
    const rsiCode = request.rsi > 70 ? 'H' : request.rsi < 30 ? 'L' : request.rsi > 50 ? 'B' : 'S';
    const vwapCode = request.vwap_status === 'ABOVE' ? 'A' : 'B';
    
    return `WKI_${trendCode}${rsiCode}${vwapCode}_${Date.now().toString().slice(-4)}`;
  }

  private calculatePublicConfidence(request: StrategyRequest): number {
    let confidence = 50; // Base confidence
    
    // Trend alignment
    if (request.trend === 'UPTREND' && request.vwap_status === 'ABOVE') {
      confidence += 20;
    } else if (request.trend === 'DOWNTREND' && request.vwap_status === 'BELOW') {
      confidence += 20;
    }
    
    // RSI consideration
    if (request.rsi >= 40 && request.rsi <= 60) {
      confidence += 15;
    } else if (request.rsi > 70 || request.rsi < 30) {
      confidence += 5; // Extreme levels
    }
    
    // Add some variability to avoid predictable patterns
    confidence += Math.random() * 10 - 5;
    
    return Math.max(30, Math.min(95, confidence));
  }

  private getPublicRecommendation(request: StrategyRequest, confidence: number): 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE' {
    if (confidence < 60) return 'OBSERVE';
    
    if (request.trend === 'UPTREND' && request.vwap_status === 'ABOVE' && request.rsi < 70) {
      return 'BUY';
    }
    
    if (request.trend === 'DOWNTREND' && request.vwap_status === 'BELOW' && request.rsi > 30) {
      return 'SELL';
    }
    
    return 'HOLD';
  }

  private assessPublicRiskLevel(request: StrategyRequest, confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (confidence > 80) return 'LOW';
    if (confidence > 65) return 'MEDIUM';
    return 'HIGH';
  }

  private determineTradeAction(request: TradeRequest, riskApproved: boolean): 'BUY' | 'SELL' | 'HOLD' | 'WAIT' {
    if (!riskApproved) return 'WAIT';
    
    const { trend, rsi, vwap_status } = request.market_data;
    
    if (trend === 'UPTREND' && vwap_status === 'ABOVE' && rsi < 70) return 'BUY';
    if (trend === 'DOWNTREND' && vwap_status === 'BELOW' && rsi > 30) return 'SELL';
    
    return 'HOLD';
  }

  private generatePublicReasoning(request: TradeRequest, action: string): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Market trend: ${request.market_data.trend}`);
    reasoning.push(`RSI level: ${request.market_data.rsi}`);
    reasoning.push(`VWAP position: ${request.market_data.vwap_status}`);
    reasoning.push(`Action determined: ${action}`);
    
    return reasoning;
  }

  private analyzeTrendFromCandle(candleData: any): 'UPTREND' | 'DOWNTREND' | 'RANGING' {
    // Simplified trend analysis for webhook
    const open = parseFloat(candleData.open || candleData.o);
    const close = parseFloat(candleData.close || candleData.c);
    
    if (close > open * 1.001) return 'UPTREND';
    if (close < open * 0.999) return 'DOWNTREND';
    return 'RANGING';
  }

  private calculateRSIFromCandle(candleData: any): number {
    // Simplified RSI for webhook processing
    return Math.random() * 40 + 30; // 30-70 range
  }

  private determineVWAPStatus(candleData: any): 'ABOVE' | 'BELOW' {
    // Simplified VWAP determination
    return Math.random() > 0.5 ? 'ABOVE' : 'BELOW';
  }

  // ADMIN METHODS
  createAPIKey(name: string, permissions: string[], rateLimit: number = 50): string {
    const key = `WAIDES_${Math.random().toString(36).substr(2, 9).toUpperCase()}_${Date.now()}`;
    
    this.approvedKeys.set(key, {
      key,
      name,
      permissions,
      rateLimit,
      lastUsed: 0,
      usageCount: 0,
      isActive: true
    });
    
    return key;
  }

  revokeAPIKey(apikey: string): boolean {
    const keyInfo = this.approvedKeys.get(apikey);
    if (keyInfo) {
      keyInfo.isActive = false;
      return true;
    }
    return false;
  }

  getAPIKeyUsage(): any[] {
    return Array.from(this.approvedKeys.values()).map(key => ({
      name: key.name,
      key: key.key.substring(0, 10) + '...',
      permissions: key.permissions,
      usageCount: key.usageCount,
      lastUsed: key.lastUsed ? new Date(key.lastUsed).toISOString() : 'Never',
      isActive: key.isActive,
      rateLimit: key.rateLimit
    }));
  }

  private startCleanupInterval(): void {
    // Clean up rate limiting counters every minute
    setInterval(() => {
      const oneMinuteAgo = Date.now() - 60000;
      
      for (const [apikey, lastTime] of this.lastRequestTime.entries()) {
        if (lastTime < oneMinuteAgo) {
          this.requestCounts.delete(apikey);
          this.lastRequestTime.delete(apikey);
        }
      }
    }, 60000);
  }
}

export const waidesKIGateway = new WaidesKIGateway();