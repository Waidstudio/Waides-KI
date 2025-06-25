import { waidesKIGenomeEngine } from './waidesKIGenomeEngine';
import { waidesKIDNAEngine } from './waidesKIDNAEngine';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';
import { waidesKIRootMemory } from './waidesKIRootMemory';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import crypto from 'crypto';

interface TrustedClient {
  client_id: string;
  client_name: string;
  api_key: string;
  access_level: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  rate_limit: number; // requests per minute
  permissions: string[];
  created_date: number;
  last_access: number;
  total_requests: number;
  is_active: boolean;
}

interface StrategyRequest {
  indicators: {
    trend: string;
    rsi: number;
    vwap_status: string;
    price: number;
    ema50: number;
    ema200?: number;
    volume?: number;
  };
  client_context?: {
    platform: string;
    user_id?: string;
    session_id?: string;
    risk_tolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  strategy_preferences?: {
    mutation_intensity?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    exclude_patterns?: string[];
    max_risk_level?: number;
  };
}

interface StrategyResponse {
  strategy_id: string;
  dna_id: string;
  strategy_code: string;
  confidence_level: number;
  risk_assessment: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    expected_win_rate: number;
    max_drawdown_estimate: number;
  };
  execution_guidance: {
    entry_signals: string[];
    exit_signals: string[];
    position_size_recommendation: number;
  };
  metadata: {
    generation_timestamp: number;
    mutation_type: string;
    parent_strategy?: string;
    expected_lifespan: number;
  };
}

interface APIRequest {
  request_id: string;
  client_id: string;
  endpoint: string;
  request_data: any;
  response_data: any;
  timestamp: number;
  processing_time: number;
  status: 'SUCCESS' | 'ERROR' | 'BLOCKED' | 'RATE_LIMITED';
  error_message?: string;
  risk_flags: string[];
}

interface RateLimitTracker {
  client_id: string;
  minute_window: number;
  request_count: number;
  last_reset: number;
}

export class WaidesKIExternalAPIGateway {
  private trustedClients: Map<string, TrustedClient> = new Map();
  private apiRequests: APIRequest[] = [];
  private rateLimitTrackers: Map<string, RateLimitTracker> = new Map();
  private securitySalt: string;
  private maxRequestHistory: number = 10000;

  constructor() {
    this.securitySalt = this.generateSecuritySalt();
    this.initializeTrustedClients();
    this.startMaintenanceCycle();
  }

  private generateSecuritySalt(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private initializeTrustedClients(): void {
    // Initialize with demo clients
    const demoClients: Omit<TrustedClient, 'api_key'>[] = [
      {
        client_id: 'DEMO_AFRIWAID_STUDIO',
        client_name: 'Afriwaid Studio',
        access_level: 'ENTERPRISE',
        rate_limit: 100, // 100 requests per minute
        permissions: ['strategy_generation', 'dna_analysis', 'risk_assessment', 'historical_data'],
        created_date: Date.now(),
        last_access: 0,
        total_requests: 0,
        is_active: true
      },
      {
        client_id: 'DEMO_KONSMIA_MARKET',
        client_name: 'Konsmia Market App',
        access_level: 'PREMIUM',
        rate_limit: 50,
        permissions: ['strategy_generation', 'dna_analysis', 'risk_assessment'],
        created_date: Date.now(),
        last_access: 0,
        total_requests: 0,
        is_active: true
      },
      {
        client_id: 'DEMO_BASIC_TRADER',
        client_name: 'Basic Trading Platform',
        access_level: 'BASIC',
        rate_limit: 20,
        permissions: ['strategy_generation'],
        created_date: Date.now(),
        last_access: 0,
        total_requests: 0,
        is_active: true
      }
    ];

    // Generate API keys and register clients
    demoClients.forEach(clientData => {
      const apiKey = this.generateAPIKey(clientData.client_id);
      const client: TrustedClient = { ...clientData, api_key: apiKey };
      this.trustedClients.set(apiKey, client);
    });

    waidesKIDailyReporter.recordLesson(
      `Initialized External API Gateway with ${demoClients.length} trusted clients`,
      'SYSTEM',
      'HIGH',
      'API Gateway'
    );
  }

  private generateAPIKey(clientId: string): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', this.securitySalt)
      .update(clientId + timestamp + random)
      .digest('hex');
    return `wk_${hash.substring(0, 32)}`;
  }

  private startMaintenanceCycle(): void {
    // Clean old requests and reset rate limits every minute
    setInterval(() => {
      this.cleanOldRequests();
      this.resetRateLimits();
    }, 60 * 1000);
  }

  // AUTHENTICATION AND AUTHORIZATION
  authenticateClient(apiKey: string): TrustedClient | null {
    const client = this.trustedClients.get(apiKey);
    if (!client || !client.is_active) {
      return null;
    }
    
    // Update last access
    client.last_access = Date.now();
    return client;
  }

  private checkRateLimit(clientId: string, rateLimit: number): boolean {
    const currentMinute = Math.floor(Date.now() / 60000);
    let tracker = this.rateLimitTrackers.get(clientId);
    
    if (!tracker || tracker.minute_window !== currentMinute) {
      // New minute window
      tracker = {
        client_id: clientId,
        minute_window: currentMinute,
        request_count: 0,
        last_reset: Date.now()
      };
      this.rateLimitTrackers.set(clientId, tracker);
    }
    
    if (tracker.request_count >= rateLimit) {
      return false; // Rate limit exceeded
    }
    
    tracker.request_count++;
    return true;
  }

  private checkPermissions(client: TrustedClient, requiredPermission: string): boolean {
    return client.permissions.includes(requiredPermission);
  }

  // CORE API ENDPOINTS
  async generateStrategy(apiKey: string, request: StrategyRequest): Promise<StrategyResponse | { error: string; status: number }> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      // Authenticate client
      const client = this.authenticateClient(apiKey);
      if (!client) {
        this.logRequest(requestId, 'UNKNOWN', '/api/strategy', request, null, startTime, 'ERROR', 'Invalid API key', ['AUTHENTICATION_FAILED']);
        return { error: 'Unauthorized access', status: 403 };
      }
      
      // Check rate limit
      if (!this.checkRateLimit(client.client_id, client.rate_limit)) {
        this.logRequest(requestId, client.client_id, '/api/strategy', request, null, startTime, 'RATE_LIMITED', 'Rate limit exceeded', ['RATE_LIMIT']);
        return { error: 'Rate limit exceeded', status: 429 };
      }
      
      // Check permissions
      if (!this.checkPermissions(client, 'strategy_generation')) {
        this.logRequest(requestId, client.client_id, '/api/strategy', request, null, startTime, 'ERROR', 'Insufficient permissions', ['PERMISSION_DENIED']);
        return { error: 'Insufficient permissions', status: 403 };
      }
      
      // Validate request data
      const validationResult = this.validateStrategyRequest(request);
      if (!validationResult.isValid) {
        this.logRequest(requestId, client.client_id, '/api/strategy', request, null, startTime, 'ERROR', validationResult.error, ['VALIDATION_ERROR']);
        return { error: validationResult.error, status: 400 };
      }
      
      // Generate strategy
      const baseStrategyId = `${client.client_name.replace(/\s+/g, '_')}_${Date.now()}`;
      const indicators = request.indicators;
      
      // Create base indicators for genome engine
      const baseIndicators = {
        trend: indicators.trend,
        rsi: indicators.rsi,
        vwap_status: indicators.vwap_status,
        price: indicators.price,
        ema50: indicators.ema50,
        ema200: indicators.ema200 || indicators.ema50 - 50,
        volume: indicators.volume || 1500000
      };
      
      // Generate new strategy using genome engine
      const newStrategyId = waidesKIGenomeEngine.createNewStrategy(baseStrategyId, baseIndicators);
      const generatedStrategy = waidesKIGenomeEngine.getStrategy(newStrategyId);
      
      if (!generatedStrategy) {
        this.logRequest(requestId, client.client_id, '/api/strategy', request, null, startTime, 'ERROR', 'Strategy generation failed', ['GENERATION_FAILED']);
        return { error: 'Strategy generation failed', status: 500 };
      }
      
      // Security checks
      const riskFlags = await this.performSecurityChecks(generatedStrategy.dna_id, request);
      
      if (riskFlags.includes('DNA_UNSTABLE') || riskFlags.includes('HIGH_RISK_PATTERN')) {
        this.logRequest(requestId, client.client_id, '/api/strategy', request, null, startTime, 'BLOCKED', 'Strategy blocked due to risk', riskFlags);
        return { error: 'Strategy blocked due to security concerns', status: 200 };
      }
      
      // Register in memory tree
      waidesKIRootMemory.registerStrategy(
        newStrategyId,
        generatedStrategy.dna_id,
        'PENDING',
        0,
        generatedStrategy.confidence_level,
        {
          source: 'EXTERNAL_API',
          client: client.client_name,
          request_id: requestId
        }
      );
      
      // Create response
      const response: StrategyResponse = {
        strategy_id: newStrategyId,
        dna_id: generatedStrategy.dna_id,
        strategy_code: generatedStrategy.strategy_code,
        confidence_level: generatedStrategy.confidence_level,
        risk_assessment: {
          risk_level: this.assessRiskLevel(generatedStrategy),
          expected_win_rate: this.estimateWinRate(generatedStrategy),
          max_drawdown_estimate: this.estimateMaxDrawdown(generatedStrategy)
        },
        execution_guidance: {
          entry_signals: this.generateEntrySignals(generatedStrategy),
          exit_signals: this.generateExitSignals(generatedStrategy),
          position_size_recommendation: this.calculatePositionSize(client.access_level, request.strategy_preferences?.max_risk_level)
        },
        metadata: {
          generation_timestamp: Date.now(),
          mutation_type: generatedStrategy.mutation_type,
          parent_strategy: generatedStrategy.source_strategy,
          expected_lifespan: this.calculateExpectedLifespan(generatedStrategy)
        }
      };
      
      // Update client stats
      client.total_requests++;
      
      // Log successful request
      this.logRequest(requestId, client.client_id, '/api/strategy', request, response, startTime, 'SUCCESS', undefined, riskFlags);
      
      return response;
      
    } catch (error) {
      this.logRequest(requestId, 'UNKNOWN', '/api/strategy', request, null, startTime, 'ERROR', error.message, ['INTERNAL_ERROR']);
      return { error: 'Internal server error', status: 500 };
    }
  }

  async analyzeDNA(apiKey: string, dnaId: string): Promise<any | { error: string; status: number }> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      const client = this.authenticateClient(apiKey);
      if (!client) {
        return { error: 'Unauthorized access', status: 403 };
      }
      
      if (!this.checkRateLimit(client.client_id, client.rate_limit)) {
        return { error: 'Rate limit exceeded', status: 429 };
      }
      
      if (!this.checkPermissions(client, 'dna_analysis')) {
        return { error: 'Insufficient permissions', status: 403 };
      }
      
      const dnaInfo = waidesKIDNAEngine.getDNAInfo(dnaId);
      const signatureInfo = waidesKISignatureTracker.getDNAPerformance(dnaId);
      
      if (!dnaInfo) {
        return { error: 'DNA pattern not found', status: 404 };
      }
      
      const analysis = {
        dna_id: dnaId,
        pattern_analysis: dnaInfo,
        performance_history: signatureInfo,
        risk_assessment: {
          stability_score: signatureInfo?.stability_score || 50,
          anomaly_detected: signatureInfo?.has_anomalies || false,
          recommendation: this.getDNARecommendation(dnaInfo, signatureInfo)
        },
        usage_statistics: {
          total_usage: signatureInfo?.total_usage || 0,
          success_rate: signatureInfo?.success_rate || 0,
          last_used: signatureInfo?.last_used || 0
        }
      };
      
      client.total_requests++;
      this.logRequest(requestId, client.client_id, '/api/dna/analyze', { dna_id: dnaId }, analysis, startTime, 'SUCCESS');
      
      return analysis;
      
    } catch (error) {
      this.logRequest(requestId, 'UNKNOWN', '/api/dna/analyze', { dna_id: dnaId }, null, startTime, 'ERROR', error.message, ['INTERNAL_ERROR']);
      return { error: 'Internal server error', status: 500 };
    }
  }

  async getMarketInsights(apiKey: string): Promise<any | { error: string; status: number }> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      const client = this.authenticateClient(apiKey);
      if (!client) {
        return { error: 'Unauthorized access', status: 403 };
      }
      
      if (!this.checkRateLimit(client.client_id, client.rate_limit)) {
        return { error: 'Rate limit exceeded', status: 429 };
      }
      
      const memoryStats = waidesKIRootMemory.getTreeStatistics();
      const genomeStats = waidesKIGenomeEngine.getGenerationStatistics();
      const riskProfile = waidesKIRiskManager.getRiskProfile();
      
      const insights = {
        market_intelligence: {
          active_strategies: memoryStats.active_nodes,
          successful_patterns: Math.round(memoryStats.avg_win_rate),
          evolution_events: memoryStats.evolution_events,
          memory_health: memoryStats.memory_health
        },
        strategy_generation: {
          total_generated: genomeStats.total_generated,
          vault_strategies: genomeStats.vault_strategies,
          generation_health: genomeStats.generation_health,
          best_performance: genomeStats.best_strategy?.performance_score || 0
        },
        risk_environment: {
          current_risk_level: riskProfile.maxRiskPercent,
          market_volatility: 'MODERATE', // Could be calculated from actual data
          recommended_position_size: riskProfile.maxRiskPercent * 0.5
        },
        timestamp: Date.now()
      };
      
      client.total_requests++;
      this.logRequest(requestId, client.client_id, '/api/market/insights', {}, insights, startTime, 'SUCCESS');
      
      return insights;
      
    } catch (error) {
      this.logRequest(requestId, 'UNKNOWN', '/api/market/insights', {}, null, startTime, 'ERROR', error.message, ['INTERNAL_ERROR']);
      return { error: 'Internal server error', status: 500 };
    }
  }

  // VALIDATION AND SECURITY
  private validateStrategyRequest(request: StrategyRequest): { isValid: boolean; error?: string } {
    if (!request.indicators) {
      return { isValid: false, error: 'indicators field is required' };
    }
    
    const { indicators } = request;
    
    if (typeof indicators.rsi !== 'number' || indicators.rsi < 0 || indicators.rsi > 100) {
      return { isValid: false, error: 'RSI must be a number between 0 and 100' };
    }
    
    if (typeof indicators.price !== 'number' || indicators.price <= 0) {
      return { isValid: false, error: 'Price must be a positive number' };
    }
    
    if (typeof indicators.ema50 !== 'number' || indicators.ema50 <= 0) {
      return { isValid: false, error: 'EMA50 must be a positive number' };
    }
    
    if (!['ABOVE', 'BELOW'].includes(indicators.vwap_status)) {
      return { isValid: false, error: 'vwap_status must be either ABOVE or BELOW' };
    }
    
    if (!['UPTREND', 'DOWNTREND', 'RANGING'].includes(indicators.trend)) {
      return { isValid: false, error: 'trend must be UPTREND, DOWNTREND, or RANGING' };
    }
    
    return { isValid: true };
  }

  private async performSecurityChecks(dnaId: string, request: StrategyRequest): Promise<string[]> {
    const riskFlags: string[] = [];
    
    // Check DNA stability
    const dnaInfo = waidesKIDNAEngine.getDNAInfo(dnaId);
    const signatureInfo = waidesKISignatureTracker.getDNAPerformance(dnaId);
    
    if (signatureInfo?.has_anomalies) {
      riskFlags.push('DNA_UNSTABLE');
    }
    
    if (signatureInfo?.is_blocked) {
      riskFlags.push('BLOCKED_PATTERN');
    }
    
    // Check for high-risk market conditions
    if (request.indicators.rsi > 85 || request.indicators.rsi < 15) {
      riskFlags.push('EXTREME_RSI');
    }
    
    // Check for suspicious patterns
    if (request.strategy_preferences?.mutation_intensity === 'AGGRESSIVE' && 
        (!request.strategy_preferences?.max_risk_level || request.strategy_preferences.max_risk_level > 80)) {
      riskFlags.push('HIGH_RISK_PATTERN');
    }
    
    return riskFlags;
  }

  // HELPER METHODS
  private assessRiskLevel(strategy: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (strategy.performance_score > 70) return 'LOW';
    if (strategy.performance_score > 40) return 'MEDIUM';
    return 'HIGH';
  }

  private estimateWinRate(strategy: any): number {
    // Base estimate on historical performance and mutation type
    let baseRate = 55; // Default expectation
    
    if (strategy.test_results && strategy.test_results.length > 0) {
      const avgWinRate = strategy.test_results.reduce((sum: number, test: any) => sum + test.win_rate, 0) / strategy.test_results.length;
      baseRate = avgWinRate;
    }
    
    // Adjust based on mutation type
    switch (strategy.mutation_type) {
      case 'HYBRID_COMBO': baseRate *= 0.95; break;
      case 'RSI_SHIFT': baseRate *= 1.02; break;
      case 'VWAP_FLIP': baseRate *= 0.98; break;
      default: break;
    }
    
    return Math.max(30, Math.min(85, Math.round(baseRate)));
  }

  private estimateMaxDrawdown(strategy: any): number {
    let baseDrawdown = 15; // Default 15%
    
    if (strategy.test_results && strategy.test_results.length > 0) {
      const avgDrawdown = strategy.test_results.reduce((sum: number, test: any) => sum + (test.max_drawdown || 15), 0) / strategy.test_results.length;
      baseDrawdown = avgDrawdown;
    }
    
    return Math.max(5, Math.min(35, Math.round(baseDrawdown)));
  }

  private generateEntrySignals(strategy: any): string[] {
    const signals: string[] = [];
    const params = strategy.parameters;
    
    if (params.rsi_threshold > 50) {
      signals.push(`RSI crosses below ${params.rsi_threshold.toFixed(1)}`);
    } else {
      signals.push(`RSI crosses above ${params.rsi_threshold.toFixed(1)}`);
    }
    
    signals.push(`Price ${params.vwap_requirement === 'ABOVE' ? 'above' : 'below'} VWAP`);
    signals.push(`EMA50 gap less than ${params.ema_gap_max.toFixed(0)}`);
    
    if (params.volume_min > 1000000) {
      signals.push(`Volume above ${(params.volume_min / 1000000).toFixed(1)}M`);
    }
    
    return signals;
  }

  private generateExitSignals(strategy: any): string[] {
    const signals: string[] = [];
    const params = strategy.parameters;
    
    // Opposite conditions for exit
    if (params.rsi_threshold > 50) {
      signals.push(`RSI crosses above ${Math.min(80, params.rsi_threshold + 10).toFixed(1)}`);
    } else {
      signals.push(`RSI crosses below ${Math.max(20, params.rsi_threshold - 10).toFixed(1)}`);
    }
    
    signals.push(`Price crosses ${params.vwap_requirement === 'ABOVE' ? 'below' : 'above'} VWAP`);
    signals.push('Stop loss: -2% from entry');
    signals.push('Take profit: +3% from entry');
    
    return signals;
  }

  private calculatePositionSize(accessLevel: TrustedClient['access_level'], maxRisk?: number): number {
    let baseSize = 1; // 1% default
    
    switch (accessLevel) {
      case 'BASIC': baseSize = 0.5; break;
      case 'PREMIUM': baseSize = 1.0; break;
      case 'ENTERPRISE': baseSize = 1.5; break;
    }
    
    if (maxRisk && maxRisk < baseSize) {
      baseSize = maxRisk;
    }
    
    return Math.max(0.1, Math.min(2.0, baseSize));
  }

  private calculateExpectedLifespan(strategy: any): number {
    // Expected lifespan in hours based on mutation type and performance
    let baseLifespan = 24; // 24 hours default
    
    if (strategy.performance_score > 70) baseLifespan *= 2;
    if (strategy.performance_score < 40) baseLifespan *= 0.5;
    
    switch (strategy.mutation_type) {
      case 'CONSERVATIVE': baseLifespan *= 1.5; break;
      case 'AGGRESSIVE': baseLifespan *= 0.7; break;
      case 'EXPERIMENTAL': baseLifespan *= 0.5; break;
      default: break;
    }
    
    return Math.round(baseLifespan);
  }

  private getDNARecommendation(dnaInfo: any, signatureInfo: any): string {
    if (signatureInfo?.is_blocked) return 'AVOID - Pattern is blocked';
    if (signatureInfo?.has_anomalies) return 'CAUTION - Anomalies detected';
    if (signatureInfo?.success_rate > 70) return 'RECOMMENDED - High success rate';
    if (signatureInfo?.success_rate > 50) return 'MODERATE - Average performance';
    return 'RISKY - Below average performance';
  }

  private generateRequestId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  private logRequest(
    requestId: string,
    clientId: string,
    endpoint: string,
    requestData: any,
    responseData: any,
    startTime: number,
    status: APIRequest['status'],
    errorMessage?: string,
    riskFlags: string[] = []
  ): void {
    const request: APIRequest = {
      request_id: requestId,
      client_id: clientId,
      endpoint,
      request_data: requestData,
      response_data: responseData,
      timestamp: startTime,
      processing_time: Date.now() - startTime,
      status,
      error_message: errorMessage,
      risk_flags: riskFlags
    };
    
    this.apiRequests.push(request);
    
    // Log significant events
    if (status === 'ERROR' || riskFlags.length > 0) {
      waidesKIDailyReporter.recordLesson(
        `API request ${requestId} from ${clientId}: ${status} ${errorMessage || ''} (Flags: ${riskFlags.join(', ')})`,
        'API',
        status === 'ERROR' ? 'HIGH' : 'MEDIUM',
        'External API Gateway'
      );
    }
  }

  private cleanOldRequests(): void {
    // Keep only last 10000 requests
    if (this.apiRequests.length > this.maxRequestHistory) {
      this.apiRequests = this.apiRequests.slice(-this.maxRequestHistory);
    }
  }

  private resetRateLimits(): void {
    const currentMinute = Math.floor(Date.now() / 60000);
    
    for (const [clientId, tracker] of this.rateLimitTrackers.entries()) {
      if (tracker.minute_window < currentMinute) {
        this.rateLimitTrackers.delete(clientId);
      }
    }
  }

  // PUBLIC INTERFACE METHODS
  getAllTrustedClients(): TrustedClient[] {
    return Array.from(this.trustedClients.values()).map(client => ({
      ...client,
      api_key: client.api_key.substring(0, 8) + '...' // Mask API key
    }));
  }

  getAPIStatistics(): {
    total_clients: number;
    active_clients: number;
    total_requests: number;
    requests_last_hour: number;
    success_rate: number;
    most_active_client: string;
    request_distribution: { [endpoint: string]: number };
  } {
    const clients = Array.from(this.trustedClients.values());
    const activeClients = clients.filter(c => c.last_access > Date.now() - 24 * 60 * 60 * 1000);
    const totalRequests = clients.reduce((sum, c) => sum + c.total_requests, 0);
    
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentRequests = this.apiRequests.filter(r => r.timestamp > oneHourAgo);
    const successfulRequests = this.apiRequests.filter(r => r.status === 'SUCCESS');
    
    const requestDistribution: { [endpoint: string]: number } = {};
    this.apiRequests.forEach(req => {
      requestDistribution[req.endpoint] = (requestDistribution[req.endpoint] || 0) + 1;
    });
    
    const mostActiveClient = clients.reduce((most, current) => 
      current.total_requests > most.total_requests ? current : most, clients[0] || null);
    
    return {
      total_clients: clients.length,
      active_clients: activeClients.length,
      total_requests: totalRequests,
      requests_last_hour: recentRequests.length,
      success_rate: this.apiRequests.length > 0 ? (successfulRequests.length / this.apiRequests.length) * 100 : 0,
      most_active_client: mostActiveClient?.client_name || 'None',
      request_distribution: requestDistribution
    };
  }

  getRecentRequests(limit: number = 50): APIRequest[] {
    return this.apiRequests.slice(-limit).reverse();
  }

  addTrustedClient(clientName: string, accessLevel: TrustedClient['access_level'], permissions: string[]): string {
    const clientId = `CUSTOM_${clientName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`;
    const apiKey = this.generateAPIKey(clientId);
    
    const rateLimit = accessLevel === 'ENTERPRISE' ? 200 : accessLevel === 'PREMIUM' ? 100 : 50;
    
    const client: TrustedClient = {
      client_id: clientId,
      client_name: clientName,
      api_key: apiKey,
      access_level: accessLevel,
      rate_limit: rateLimit,
      permissions,
      created_date: Date.now(),
      last_access: 0,
      total_requests: 0,
      is_active: true
    };
    
    this.trustedClients.set(apiKey, client);
    
    waidesKIDailyReporter.recordLesson(
      `Added new trusted client: ${clientName} (${accessLevel})`,
      'SYSTEM',
      'HIGH',
      'API Gateway'
    );
    
    return apiKey;
  }

  deactivateClient(apiKey: string): boolean {
    const client = this.trustedClients.get(apiKey);
    if (client) {
      client.is_active = false;
      return true;
    }
    return false;
  }

  reactivateClient(apiKey: string): boolean {
    const client = this.trustedClients.get(apiKey);
    if (client) {
      client.is_active = true;
      return true;
    }
    return false;
  }

  updateClientPermissions(apiKey: string, permissions: string[]): boolean {
    const client = this.trustedClients.get(apiKey);
    if (client) {
      client.permissions = permissions;
      return true;
    }
    return false;
  }

  exportAPIData(): any {
    return {
      trusted_clients: this.getAllTrustedClients(),
      api_statistics: this.getAPIStatistics(),
      recent_requests: this.getRecentRequests(100),
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIExternalAPIGateway = new WaidesKIExternalAPIGateway();