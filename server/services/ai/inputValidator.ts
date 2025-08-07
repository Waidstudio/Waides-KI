/**
 * Input Validator - Universal Input Validation for AI Models
 * Validates and sanitizes inputs for all 6 trading entities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
  confidence: number;
}

export interface MarketData {
  price: number;
  volume: number;
  timestamp: number;
  symbol: string;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  quantity: number;
  price: number;
  timestamp: number;
  reason: string;
  entity: string;
}

export interface PortfolioData {
  totalValue: number;
  availableBalance: number;
  positions: Position[];
  riskLevel: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
}

export class InputValidator {
  private anomalyThresholds = {
    priceDeviation: 0.10,      // 10% price deviation from recent average
    volumeSpike: 5.0,          // 5x volume spike threshold
    confidenceMin: 0.1,        // Minimum confidence threshold
    confidenceMax: 1.0,        // Maximum confidence threshold
    maxQuantityPerTrade: 0.2,  // Max 20% of portfolio per trade
    minTradeAmount: 10,        // Minimum $10 trade
    maxPriceAge: 60000         // Max 1 minute old price data
  };

  private validSymbols = new Set([
    'ETHUSDT', 'BTCUSDT', 'SOLUSDT', 'ETH3LUSDT', 'ETH3SUSDT',
    'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT', 'AVAXUSDT'
  ]);

  private recentPrices = new Map<string, number[]>();
  private recentVolumes = new Map<string, number[]>();

  constructor() {
    console.log('🛡️ Input Validator initialized for all entities');
  }

  public validateMarketData(data: MarketData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    // Basic null/undefined checks
    if (!data) {
      return {
        isValid: false,
        errors: ['Market data is null or undefined'],
        warnings: [],
        confidence: 0
      };
    }

    // Validate price
    if (typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Invalid price: must be a positive number');
    }

    // Validate volume
    if (typeof data.volume !== 'number' || data.volume < 0) {
      errors.push('Invalid volume: must be a non-negative number');
    }

    // Validate timestamp
    if (!data.timestamp || typeof data.timestamp !== 'number') {
      errors.push('Invalid timestamp: must be a valid number');
    } else {
      const age = Date.now() - data.timestamp;
      if (age > this.anomalyThresholds.maxPriceAge) {
        warnings.push(`Price data is ${Math.floor(age/1000)}s old`);
        confidence *= 0.9;
      }
    }

    // Validate symbol
    if (!data.symbol || typeof data.symbol !== 'string') {
      errors.push('Invalid symbol: must be a non-empty string');
    } else if (!this.validSymbols.has(data.symbol)) {
      warnings.push(`Unknown symbol: ${data.symbol}`);
      confidence *= 0.8;
    }

    // Check for price anomalies
    const priceAnomaly = this.checkPriceAnomaly(data.symbol, data.price);
    if (priceAnomaly.isAnomalous) {
      warnings.push(`Price anomaly detected: ${priceAnomaly.description}`);
      confidence *= priceAnomaly.confidenceMultiplier;
    }

    // Check for volume anomalies
    const volumeAnomaly = this.checkVolumeAnomaly(data.symbol, data.volume);
    if (volumeAnomaly.isAnomalous) {
      warnings.push(`Volume anomaly detected: ${volumeAnomaly.description}`);
      confidence *= volumeAnomaly.confidenceMultiplier;
    }

    // Update historical data
    this.updateHistoricalData(data.symbol, data.price, data.volume);

    // Sanitize data
    const sanitizedData = this.sanitizeMarketData(data);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData,
      confidence: Math.max(0, confidence)
    };
  }

  public validateTradingSignal(signal: TradingSignal): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    // Basic validation
    if (!signal) {
      return {
        isValid: false,
        errors: ['Trading signal is null or undefined'],
        warnings: [],
        confidence: 0
      };
    }

    // Validate action
    if (!signal.action || !['BUY', 'SELL', 'HOLD'].includes(signal.action)) {
      errors.push('Invalid action: must be BUY, SELL, or HOLD');
    }

    // Validate confidence
    if (typeof signal.confidence !== 'number' || 
        signal.confidence < this.anomalyThresholds.confidenceMin || 
        signal.confidence > this.anomalyThresholds.confidenceMax) {
      errors.push(`Invalid confidence: must be between ${this.anomalyThresholds.confidenceMin} and ${this.anomalyThresholds.confidenceMax}`);
    } else if (signal.confidence < 0.3) {
      warnings.push('Low confidence signal');
      confidence *= 0.7;
    }

    // Validate quantity
    if (typeof signal.quantity !== 'number' || signal.quantity <= 0) {
      errors.push('Invalid quantity: must be a positive number');
    }

    // Validate price
    if (typeof signal.price !== 'number' || signal.price <= 0) {
      errors.push('Invalid price: must be a positive number');
    }

    // Validate symbol
    if (!this.validSymbols.has(signal.symbol)) {
      warnings.push(`Unknown symbol in signal: ${signal.symbol}`);
      confidence *= 0.8;
    }

    // Validate entity
    const validEntities = ['alpha', 'beta', 'gamma', 'omega', 'delta', 'epsilon'];
    if (!signal.entity || !validEntities.includes(signal.entity)) {
      warnings.push(`Unknown entity: ${signal.entity}`);
      confidence *= 0.9;
    }

    // Check for conflicting signals
    const conflictCheck = this.checkSignalConflicts(signal);
    if (conflictCheck.hasConflict) {
      warnings.push(`Potential signal conflict: ${conflictCheck.description}`);
      confidence *= conflictCheck.confidenceMultiplier;
    }

    // Sanitize signal
    const sanitizedData = this.sanitizeTradingSignal(signal);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData,
      confidence: Math.max(0, confidence * signal.confidence)
    };
  }

  public validatePortfolioData(data: PortfolioData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 1.0;

    if (!data) {
      return {
        isValid: false,
        errors: ['Portfolio data is null or undefined'],
        warnings: [],
        confidence: 0
      };
    }

    // Validate total value
    if (typeof data.totalValue !== 'number' || data.totalValue < 0) {
      errors.push('Invalid total value: must be non-negative');
    }

    // Validate available balance
    if (typeof data.availableBalance !== 'number' || data.availableBalance < 0) {
      errors.push('Invalid available balance: must be non-negative');
    }

    // Validate positions
    if (!Array.isArray(data.positions)) {
      errors.push('Invalid positions: must be an array');
    } else {
      data.positions.forEach((position, index) => {
        const positionErrors = this.validatePosition(position);
        if (positionErrors.length > 0) {
          errors.push(`Position ${index}: ${positionErrors.join(', ')}`);
        }
      });
    }

    // Validate risk level
    if (typeof data.riskLevel !== 'number' || data.riskLevel < 0 || data.riskLevel > 1) {
      errors.push('Invalid risk level: must be between 0 and 1');
    }

    // Check for portfolio anomalies
    if (data.availableBalance > data.totalValue) {
      warnings.push('Available balance exceeds total value');
      confidence *= 0.8;
    }

    const positionValue = data.positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
    const calculatedTotal = data.availableBalance + positionValue;
    const valueDifference = Math.abs(calculatedTotal - data.totalValue) / data.totalValue;
    
    if (valueDifference > 0.05) { // 5% threshold
      warnings.push(`Portfolio value mismatch: calculated ${calculatedTotal}, reported ${data.totalValue}`);
      confidence *= 0.7;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: this.sanitizePortfolioData(data),
      confidence
    };
  }

  private validatePosition(position: Position): string[] {
    const errors: string[] = [];

    if (!position.symbol || typeof position.symbol !== 'string') {
      errors.push('missing or invalid symbol');
    }

    if (typeof position.quantity !== 'number' || position.quantity <= 0) {
      errors.push('invalid quantity');
    }

    if (typeof position.avgPrice !== 'number' || position.avgPrice <= 0) {
      errors.push('invalid average price');
    }

    if (typeof position.currentPrice !== 'number' || position.currentPrice <= 0) {
      errors.push('invalid current price');
    }

    if (typeof position.unrealizedPnL !== 'number') {
      errors.push('invalid unrealized PnL');
    }

    return errors;
  }

  public sanitizeInputs(inputs: any): any {
    if (inputs === null || inputs === undefined) {
      return null;
    }

    if (Array.isArray(inputs)) {
      return inputs.map(item => this.sanitizeInputs(item));
    }

    if (typeof inputs === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(inputs)) {
        sanitized[key] = this.sanitizeInputs(value);
      }
      return sanitized;
    }

    if (typeof inputs === 'string') {
      return inputs.trim().replace(/[<>]/g, ''); // Basic XSS protection
    }

    if (typeof inputs === 'number') {
      return isNaN(inputs) || !isFinite(inputs) ? 0 : inputs;
    }

    return inputs;
  }

  public checkForAnomalies(data: any): boolean {
    if (!data) return true;

    // Check for market data anomalies
    if (data.price !== undefined && data.symbol !== undefined) {
      const priceAnomaly = this.checkPriceAnomaly(data.symbol, data.price);
      const volumeAnomaly = data.volume ? this.checkVolumeAnomaly(data.symbol, data.volume) : { isAnomalous: false };
      return priceAnomaly.isAnomalous || volumeAnomaly.isAnomalous;
    }

    // Check for signal anomalies
    if (data.action && data.confidence !== undefined) {
      return data.confidence < 0.2 || data.confidence > 1.0;
    }

    return false;
  }

  private checkPriceAnomaly(symbol: string, price: number): {
    isAnomalous: boolean;
    description: string;
    confidenceMultiplier: number;
  } {
    const recentPrices = this.recentPrices.get(symbol) || [];
    
    if (recentPrices.length < 5) {
      return { isAnomalous: false, description: '', confidenceMultiplier: 1.0 };
    }

    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const deviation = Math.abs(price - avgPrice) / avgPrice;

    if (deviation > this.anomalyThresholds.priceDeviation) {
      return {
        isAnomalous: true,
        description: `Price deviates ${(deviation * 100).toFixed(1)}% from recent average`,
        confidenceMultiplier: Math.max(0.5, 1 - deviation)
      };
    }

    return { isAnomalous: false, description: '', confidenceMultiplier: 1.0 };
  }

  private checkVolumeAnomaly(symbol: string, volume: number): {
    isAnomalous: boolean;
    description: string;
    confidenceMultiplier: number;
  } {
    const recentVolumes = this.recentVolumes.get(symbol) || [];
    
    if (recentVolumes.length < 5) {
      return { isAnomalous: false, description: '', confidenceMultiplier: 1.0 };
    }

    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const ratio = volume / avgVolume;

    if (ratio > this.anomalyThresholds.volumeSpike) {
      return {
        isAnomalous: true,
        description: `Volume spike: ${ratio.toFixed(1)}x average`,
        confidenceMultiplier: 0.8
      };
    }

    if (ratio < 0.1) {
      return {
        isAnomalous: true,
        description: `Unusually low volume: ${(ratio * 100).toFixed(1)}% of average`,
        confidenceMultiplier: 0.7
      };
    }

    return { isAnomalous: false, description: '', confidenceMultiplier: 1.0 };
  }

  private checkSignalConflicts(signal: TradingSignal): {
    hasConflict: boolean;
    description: string;
    confidenceMultiplier: number;
  } {
    // This would check against recent signals from other entities
    // For now, implement basic logic checks
    
    if (signal.action === 'HOLD' && signal.quantity > 0) {
      return {
        hasConflict: true,
        description: 'HOLD signal with non-zero quantity',
        confidenceMultiplier: 0.8
      };
    }

    return { hasConflict: false, description: '', confidenceMultiplier: 1.0 };
  }

  private updateHistoricalData(symbol: string, price: number, volume: number): void {
    // Update recent prices
    if (!this.recentPrices.has(symbol)) {
      this.recentPrices.set(symbol, []);
    }
    const prices = this.recentPrices.get(symbol)!;
    prices.push(price);
    if (prices.length > 20) prices.shift(); // Keep last 20 prices

    // Update recent volumes
    if (!this.recentVolumes.has(symbol)) {
      this.recentVolumes.set(symbol, []);
    }
    const volumes = this.recentVolumes.get(symbol)!;
    volumes.push(volume);
    if (volumes.length > 20) volumes.shift(); // Keep last 20 volumes
  }

  private sanitizeMarketData(data: MarketData): MarketData {
    return {
      price: Number(data.price.toFixed(4)),
      volume: Number(data.volume.toFixed(2)),
      timestamp: Math.floor(data.timestamp),
      symbol: data.symbol.toUpperCase(),
      high: data.high ? Number(data.high.toFixed(4)) : undefined,
      low: data.low ? Number(data.low.toFixed(4)) : undefined,
      open: data.open ? Number(data.open.toFixed(4)) : undefined,
      close: data.close ? Number(data.close.toFixed(4)) : undefined
    };
  }

  private sanitizeTradingSignal(signal: TradingSignal): TradingSignal {
    return {
      action: signal.action,
      symbol: signal.symbol.toUpperCase(),
      confidence: Number(signal.confidence.toFixed(3)),
      quantity: Number(signal.quantity.toFixed(6)),
      price: Number(signal.price.toFixed(4)),
      timestamp: Math.floor(signal.timestamp),
      reason: signal.reason.substring(0, 200), // Limit reason length
      entity: signal.entity
    };
  }

  private sanitizePortfolioData(data: PortfolioData): PortfolioData {
    return {
      totalValue: Number(data.totalValue.toFixed(2)),
      availableBalance: Number(data.availableBalance.toFixed(2)),
      positions: data.positions.map(pos => ({
        symbol: pos.symbol.toUpperCase(),
        quantity: Number(pos.quantity.toFixed(6)),
        avgPrice: Number(pos.avgPrice.toFixed(4)),
        currentPrice: Number(pos.currentPrice.toFixed(4)),
        unrealizedPnL: Number(pos.unrealizedPnL.toFixed(2))
      })),
      riskLevel: Number(data.riskLevel.toFixed(3))
    };
  }

  public getValidationStats(): {
    totalValidations: number;
    successRate: number;
    commonErrors: string[];
    averageConfidence: number;
  } {
    // This would track validation statistics in a real implementation
    return {
      totalValidations: 0,
      successRate: 0.95,
      commonErrors: ['Invalid price data', 'Low confidence signals', 'Unknown symbols'],
      averageConfidence: 0.85
    };
  }
}

// Export singleton instance
let inputValidatorInstance: InputValidator | null = null;

export function getInputValidator(): InputValidator {
  if (!inputValidatorInstance) {
    inputValidatorInstance = new InputValidator();
  }
  return inputValidatorInstance;
}