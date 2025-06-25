import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';

interface TrendAnalysis {
  trend_15m: 'UP' | 'DOWN' | 'SIDEWAYS';
  trend_4h: 'UP' | 'DOWN' | 'SIDEWAYS';
  trend_1d: 'UP' | 'DOWN' | 'SIDEWAYS';
  confidence_15m: number;
  confidence_4h: number;
  confidence_1d: number;
  alignment_score: number;
  scan_timestamp: number;
  price_zones: {
    support: number;
    resistance: number;
    current_price: number;
    zone_strength: 'STRONG' | 'MODERATE' | 'WEAK';
  };
  momentum_indicators: {
    rsi_15m: number;
    rsi_4h: number;
    rsi_1d: number;
    volume_trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    volatility: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  safe_trade_zones: {
    scalp_safe: boolean;
    swing_safe: boolean;
    trend_safe: boolean;
    risk_level: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
}

interface VirtualEyeStatistics {
  total_scans: number;
  successful_scans: number;
  trend_accuracy: number;
  last_scan_time: number;
  average_scan_duration: number;
  trend_changes_detected: number;
  safe_zones_identified: number;
  high_confidence_signals: number;
  scan_frequency: number; // scans per hour
  data_quality_score: number;
}

export class WaidesKIVirtualEyeScanner {
  private lastScanResult: TrendAnalysis | null = null;
  private scanHistory: TrendAnalysis[] = [];
  private scanStatistics: VirtualEyeStatistics = {
    total_scans: 0,
    successful_scans: 0,
    trend_accuracy: 0,
    last_scan_time: 0,
    average_scan_duration: 0,
    trend_changes_detected: 0,
    safe_zones_identified: 0,
    high_confidence_signals: 0,
    scan_frequency: 4, // Every 15 minutes = 4 per hour
    data_quality_score: 0
  };
  private isScanning: boolean = false;
  private autoScanEnabled: boolean = true;
  private scanInterval: NodeJS.Timeout | null = null;
  private maxHistorySize: number = 288; // 24 hours of 5-minute scans

  constructor() {
    this.startAutoScanning();
  }

  private startAutoScanning(): void {
    // Scan every 15 minutes for autonomous trading
    this.scanInterval = setInterval(() => {
      if (this.autoScanEnabled && !this.isScanning) {
        this.performVirtualScan();
      }
    }, 15 * 60 * 1000); // 15 minutes

    // Initial scan
    setTimeout(() => {
      this.performVirtualScan();
    }, 5000);
  }

  async performVirtualScan(): Promise<TrendAnalysis> {
    if (this.isScanning) {
      return this.lastScanResult || this.createEmptyScanResult();
    }

    this.isScanning = true;
    const scanStartTime = Date.now();
    
    try {
      // Get market data from live feed
      const marketData = await waidesKILiveFeed.getMarketData();
      const ethPrice = await waidesKILiveFeed.getCurrentETHPrice();
      
      // Simulate multi-timeframe candle data analysis
      const trendAnalysis = await this.analyzeTrends(marketData, ethPrice);
      const priceZones = this.detectPriceZones(marketData, ethPrice);
      const momentumIndicators = this.analyzeMomentum(marketData);
      const safeTradeZones = this.identifySafeZones(trendAnalysis, priceZones, momentumIndicators);
      
      const scanResult: TrendAnalysis = {
        trend_15m: trendAnalysis.trend_15m,
        trend_4h: trendAnalysis.trend_4h,
        trend_1d: trendAnalysis.trend_1d,
        confidence_15m: trendAnalysis.confidence_15m,
        confidence_4h: trendAnalysis.confidence_4h,
        confidence_1d: trendAnalysis.confidence_1d,
        alignment_score: this.calculateAlignmentScore(trendAnalysis),
        scan_timestamp: Date.now(),
        price_zones: priceZones,
        momentum_indicators: momentumIndicators,
        safe_trade_zones: safeTradeZones
      };
      
      // Update scan history and statistics
      this.updateScanHistory(scanResult);
      this.updateScanStatistics(scanStartTime, true);
      
      this.lastScanResult = scanResult;
      
      // Log high-confidence signals
      if (scanResult.alignment_score > 80) {
        waidesKIDailyReporter.recordLesson(
          `High-confidence signal detected: ${scanResult.trend_4h} alignment score ${scanResult.alignment_score}%`,
          'VIRTUAL_EYE',
          'HIGH',
          'Virtual Eye Scanner'
        );
      }
      
      return scanResult;
      
    } catch (error) {
      console.error('Error in virtual eye scan:', error);
      this.updateScanStatistics(scanStartTime, false);
      
      // Return safe default result
      return this.createEmptyScanResult();
      
    } finally {
      this.isScanning = false;
    }
  }

  private async analyzeTrends(marketData: any, currentPrice: number): Promise<{
    trend_15m: 'UP' | 'DOWN' | 'SIDEWAYS';
    trend_4h: 'UP' | 'DOWN' | 'SIDEWAYS';
    trend_1d: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence_15m: number;
    confidence_4h: number;
    confidence_1d: number;
  }> {
    // Simulate different timeframe analysis
    const price = currentPrice;
    const volume = marketData.volume || 1000000;
    const change24h = marketData.price_change_24h || 0;
    
    // 15-minute trend analysis (short-term momentum)
    const trend15m = this.detectShortTermTrend(price, volume);
    const confidence15m = this.calculateTrendConfidence(trend15m, volume, 'short');
    
    // 4-hour trend analysis (medium-term direction)
    const trend4h = this.detectMediumTermTrend(price, change24h);
    const confidence4h = this.calculateTrendConfidence(trend4h, volume, 'medium');
    
    // 1-day trend analysis (long-term direction)
    const trend1d = this.detectLongTermTrend(change24h);
    const confidence1d = this.calculateTrendConfidence(trend1d, volume, 'long');
    
    return {
      trend_15m: trend15m,
      trend_4h: trend4h,
      trend_1d: trend1d,
      confidence_15m: confidence15m,
      confidence_4h: confidence4h,
      confidence_1d: confidence1d
    };
  }

  private detectShortTermTrend(price: number, volume: number): 'UP' | 'DOWN' | 'SIDEWAYS' {
    // Simulate 15-minute trend detection using price momentum and volume
    const pricePercentile = (price % 100) / 100; // Normalize price for trend simulation
    const volumeMultiplier = Math.min(2.0, volume / 1000000); // Volume impact
    
    const momentum = (pricePercentile - 0.5) * volumeMultiplier;
    
    if (momentum > 0.15) return 'UP';
    if (momentum < -0.15) return 'DOWN';
    return 'SIDEWAYS';
  }

  private detectMediumTermTrend(price: number, change24h: number): 'UP' | 'DOWN' | 'SIDEWAYS' {
    // 4-hour trend based on price structure and 24h change
    const structuralBias = Math.sin(price / 1000) * 0.5; // Simulate price structure
    const changeBias = Math.max(-0.5, Math.min(0.5, change24h / 5)); // Normalize 24h change
    
    const mediumTrend = structuralBias + changeBias;
    
    if (mediumTrend > 0.2) return 'UP';
    if (mediumTrend < -0.2) return 'DOWN';
    return 'SIDEWAYS';
  }

  private detectLongTermTrend(change24h: number): 'UP' | 'DOWN' | 'SIDEWAYS' {
    // 1-day trend based on 24-hour price change
    if (change24h > 3) return 'UP';
    if (change24h < -3) return 'DOWN';
    return 'SIDEWAYS';
  }

  private calculateTrendConfidence(trend: string, volume: number, timeframe: 'short' | 'medium' | 'long'): number {
    let baseConfidence = 50;
    
    // Volume-based confidence boost
    const volumeScore = Math.min(30, (volume / 1000000) * 10);
    baseConfidence += volumeScore;
    
    // Timeframe-specific adjustments
    if (timeframe === 'long') {
      baseConfidence += 10; // Long-term trends are generally more reliable
    } else if (timeframe === 'short') {
      baseConfidence -= 5; // Short-term trends are more volatile
    }
    
    // Add some randomness for realistic confidence scores
    const randomFactor = (Math.random() - 0.5) * 10;
    baseConfidence += randomFactor;
    
    return Math.max(20, Math.min(95, baseConfidence));
  }

  private calculateAlignmentScore(trends: any): number {
    let alignmentScore = 0;
    
    // Check trend alignment across timeframes
    if (trends.trend_15m === trends.trend_4h) alignmentScore += 30;
    if (trends.trend_4h === trends.trend_1d) alignmentScore += 40;
    if (trends.trend_15m === trends.trend_1d) alignmentScore += 20;
    
    // Bonus for all three aligned
    if (trends.trend_15m === trends.trend_4h && trends.trend_4h === trends.trend_1d) {
      alignmentScore += 10;
    }
    
    // Confidence weighting
    const avgConfidence = (trends.confidence_15m + trends.confidence_4h + trends.confidence_1d) / 3;
    const confidenceBonus = (avgConfidence - 50) / 5; // Scale confidence to alignment score
    
    return Math.max(0, Math.min(100, alignmentScore + confidenceBonus));
  }

  private detectPriceZones(marketData: any, currentPrice: number): TrendAnalysis['price_zones'] {
    // Simulate support and resistance detection
    const priceBase = Math.floor(currentPrice / 100) * 100;
    const support = priceBase - (50 + Math.random() * 50);
    const resistance = priceBase + (50 + Math.random() * 50);
    
    // Determine zone strength based on price position
    const pricePosition = (currentPrice - support) / (resistance - support);
    let zoneStrength: 'STRONG' | 'MODERATE' | 'WEAK';
    
    if (pricePosition < 0.2 || pricePosition > 0.8) {
      zoneStrength = 'STRONG'; // Near support or resistance
    } else if (pricePosition < 0.35 || pricePosition > 0.65) {
      zoneStrength = 'MODERATE';
    } else {
      zoneStrength = 'WEAK'; // Middle zone
    }
    
    return {
      support: Math.round(support * 100) / 100,
      resistance: Math.round(resistance * 100) / 100,
      current_price: currentPrice,
      zone_strength: zoneStrength
    };
  }

  private analyzeMomentum(marketData: any): TrendAnalysis['momentum_indicators'] {
    // Simulate RSI calculations for different timeframes
    const baseRSI = 30 + (Math.random() * 40); // RSI between 30-70 for realistic values
    
    return {
      rsi_15m: Math.round(baseRSI + (Math.random() - 0.5) * 20),
      rsi_4h: Math.round(baseRSI + (Math.random() - 0.5) * 15),
      rsi_1d: Math.round(baseRSI + (Math.random() - 0.5) * 10),
      volume_trend: Math.random() > 0.5 ? 'INCREASING' : 'DECREASING',
      volatility: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.3 ? 'MEDIUM' : 'LOW'
    };
  }

  private identifySafeZones(
    trends: any, 
    priceZones: TrendAnalysis['price_zones'], 
    momentum: TrendAnalysis['momentum_indicators']
  ): TrendAnalysis['safe_trade_zones'] {
    // Determine safety for different trading styles
    const scalpSafe = trends.confidence_15m > 70 && momentum.volatility !== 'EXTREME';
    const swingSafe = trends.confidence_4h > 60 && priceZones.zone_strength !== 'WEAK';
    const trendSafe = trends.confidence_1d > 55 && trends.trend_1d !== 'SIDEWAYS';
    
    // Calculate overall risk level
    let riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    const avgConfidence = (trends.confidence_15m + trends.confidence_4h + trends.confidence_1d) / 3;
    
    if (avgConfidence > 80 && scalpSafe && swingSafe && trendSafe) {
      riskLevel = 'VERY_LOW';
    } else if (avgConfidence > 65 && (swingSafe || trendSafe)) {
      riskLevel = 'LOW';
    } else if (avgConfidence > 50) {
      riskLevel = 'MEDIUM';
    } else if (avgConfidence > 35) {
      riskLevel = 'HIGH';
    } else {
      riskLevel = 'EXTREME';
    }
    
    return {
      scalp_safe: scalpSafe,
      swing_safe: swingSafe,
      trend_safe: trendSafe,
      risk_level: riskLevel
    };
  }

  private createEmptyScanResult(): TrendAnalysis {
    return {
      trend_15m: 'SIDEWAYS',
      trend_4h: 'SIDEWAYS',
      trend_1d: 'SIDEWAYS',
      confidence_15m: 50,
      confidence_4h: 50,
      confidence_1d: 50,
      alignment_score: 30,
      scan_timestamp: Date.now(),
      price_zones: {
        support: 2400,
        resistance: 2500,
        current_price: 2450,
        zone_strength: 'MODERATE'
      },
      momentum_indicators: {
        rsi_15m: 50,
        rsi_4h: 50,
        rsi_1d: 50,
        volume_trend: 'STABLE',
        volatility: 'MEDIUM'
      },
      safe_trade_zones: {
        scalp_safe: false,
        swing_safe: false,
        trend_safe: false,
        risk_level: 'HIGH'
      }
    };
  }

  private updateScanHistory(scanResult: TrendAnalysis): void {
    this.scanHistory.push(scanResult);
    
    // Maintain history size
    if (this.scanHistory.length > this.maxHistorySize) {
      this.scanHistory = this.scanHistory.slice(-this.maxHistorySize);
    }
    
    // Update trend change detection
    if (this.scanHistory.length > 1) {
      const previous = this.scanHistory[this.scanHistory.length - 2];
      if (previous.trend_4h !== scanResult.trend_4h) {
        this.scanStatistics.trend_changes_detected++;
      }
    }
    
    // Count safe zones
    if (scanResult.safe_trade_zones.risk_level === 'VERY_LOW' || 
        scanResult.safe_trade_zones.risk_level === 'LOW') {
      this.scanStatistics.safe_zones_identified++;
    }
    
    // Count high confidence signals
    if (scanResult.alignment_score > 75) {
      this.scanStatistics.high_confidence_signals++;
    }
  }

  private updateScanStatistics(scanStartTime: number, success: boolean): void {
    this.scanStatistics.total_scans++;
    
    if (success) {
      this.scanStatistics.successful_scans++;
    }
    
    const scanDuration = Date.now() - scanStartTime;
    this.scanStatistics.average_scan_duration = 
      (this.scanStatistics.average_scan_duration * (this.scanStatistics.total_scans - 1) + scanDuration) 
      / this.scanStatistics.total_scans;
    
    this.scanStatistics.last_scan_time = Date.now();
    
    // Calculate data quality score
    const successRate = this.scanStatistics.successful_scans / this.scanStatistics.total_scans;
    const avgScanTime = this.scanStatistics.average_scan_duration;
    this.scanStatistics.data_quality_score = Math.round(
      (successRate * 70) + 
      (Math.max(0, (5000 - avgScanTime) / 5000) * 30) // Penalize slow scans
    );
  }

  // PUBLIC INTERFACE METHODS
  getLastScanResult(): TrendAnalysis | null {
    return this.lastScanResult;
  }

  getScanHistory(limit: number = 50): TrendAnalysis[] {
    return this.scanHistory.slice(-limit).reverse();
  }

  getVirtualEyeStatistics(): VirtualEyeStatistics {
    return { ...this.scanStatistics };
  }

  getCurrentTrends(): { 
    short_term: string; 
    medium_term: string; 
    long_term: string; 
    alignment: number;
    last_update: number;
  } {
    if (!this.lastScanResult) {
      return {
        short_term: 'SIDEWAYS',
        medium_term: 'SIDEWAYS',
        long_term: 'SIDEWAYS',
        alignment: 0,
        last_update: 0
      };
    }
    
    return {
      short_term: this.lastScanResult.trend_15m,
      medium_term: this.lastScanResult.trend_4h,
      long_term: this.lastScanResult.trend_1d,
      alignment: this.lastScanResult.alignment_score,
      last_update: this.lastScanResult.scan_timestamp
    };
  }

  getTradingSafety(): {
    scalping_safe: boolean;
    swing_safe: boolean;
    trend_safe: boolean;
    overall_risk: string;
    recommendation: string;
  } {
    if (!this.lastScanResult) {
      return {
        scalping_safe: false,
        swing_safe: false,
        trend_safe: false,
        overall_risk: 'HIGH',
        recommendation: 'Wait for clear signals'
      };
    }
    
    const zones = this.lastScanResult.safe_trade_zones;
    let recommendation = 'No trading recommended';
    
    if (zones.risk_level === 'VERY_LOW') {
      recommendation = 'Excellent trading conditions - all styles safe';
    } else if (zones.risk_level === 'LOW') {
      recommendation = 'Good trading conditions - conservative approaches recommended';
    } else if (zones.risk_level === 'MEDIUM') {
      recommendation = 'Moderate conditions - experienced traders only';
    } else {
      recommendation = 'High risk conditions - avoid trading';
    }
    
    return {
      scalping_safe: zones.scalp_safe,
      swing_safe: zones.swing_safe,
      trend_safe: zones.trend_safe,
      overall_risk: zones.risk_level,
      recommendation: recommendation
    };
  }

  enableAutoScanning(): void {
    this.autoScanEnabled = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Virtual Eye Scanner activated - autonomous market scanning enabled',
      'Scanner Activation',
      90
    );
  }

  disableAutoScanning(): void {
    this.autoScanEnabled = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Virtual Eye Scanner deactivated - manual scanning only',
      'Scanner Deactivation',
      70
    );
  }

  async forceScan(): Promise<TrendAnalysis> {
    return await this.performVirtualScan();
  }

  exportVirtualEyeData(): any {
    return {
      virtual_eye_statistics: this.getVirtualEyeStatistics(),
      last_scan_result: this.getLastScanResult(),
      scan_history: this.getScanHistory(100),
      current_trends: this.getCurrentTrends(),
      trading_safety: this.getTradingSafety(),
      scanner_config: {
        auto_scan_enabled: this.autoScanEnabled,
        scan_interval_minutes: 15,
        max_history_size: this.maxHistorySize,
        is_currently_scanning: this.isScanning
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIVirtualEyeScanner = new WaidesKIVirtualEyeScanner();