interface ChaosIndicators {
  volatility_spike: number;
  volume_anomaly: number;
  price_manipulation: number;
  stop_hunt_detected: boolean;
  emotional_frenzy: number;
  fake_breakout_risk: number;
  market_structure_breakdown: number;
  spiritual_disruption: number;
}

interface ShadowThreat {
  threat_type: 'VOLATILITY_CHAOS' | 'MANIPULATION_DETECTED' | 'EMOTIONAL_FRENZY' | 'FAKE_BREAKOUT' | 'STOP_HUNT' | 'SPIRITUAL_DISRUPTION' | 'SYSTEM_BREAKDOWN';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'LETHAL';
  chaos_score: number;
  threat_factors: string[];
  konslang_warning: string;
  estimated_duration: number;
  protection_needed: boolean;
}

interface ShadowDetectionStats {
  total_scans: number;
  chaos_detections: number;
  false_alarms: number;
  critical_saves: number;
  average_chaos_score: number;
  detection_accuracy: number;
  last_chaos_event: number;
  protection_triggers: number;
}

export class WaidesKIShadowDetector {
  private detection_stats: ShadowDetectionStats = {
    total_scans: 0,
    chaos_detections: 0,
    false_alarms: 0,
    critical_saves: 0,
    average_chaos_score: 0.15,
    detection_accuracy: 0,
    last_chaos_event: 0,
    protection_triggers: 0
  };

  private chaos_thresholds = {
    low_danger: 0.65,
    moderate_danger: 0.72,
    high_danger: 0.78,
    critical_danger: 0.85,
    lethal_danger: 0.92
  };

  private konslang_shadow_warnings = [
    "Mor'thain kol'veth — Darkness rises, seek the light",
    "Zar'neth yul'kaan — Fire speaks of hidden dangers",
    "Vel'thara mor'shadow — Sacred energy warns of chaos",
    "Eth'kaal kol'neth — Time fractures, instinct awakens",
    "Gor'thain vel'void — Mountains tremble before the storm"
  ];

  private chaos_patterns = [
    {
      name: 'Flash_Crash_Precursor',
      indicators: ['volatility_spike > 0.8', 'volume_anomaly > 0.7', 'price_manipulation > 0.6'],
      severity: 'CRITICAL' as const,
      typical_duration: 15 * 60 * 1000 // 15 minutes
    },
    {
      name: 'Stop_Hunt_Formation',
      indicators: ['stop_hunt_detected === true', 'price_manipulation > 0.7'],
      severity: 'HIGH' as const,
      typical_duration: 30 * 60 * 1000 // 30 minutes
    },
    {
      name: 'Emotional_Panic_Wave',
      indicators: ['emotional_frenzy > 0.8', 'volatility_spike > 0.6'],
      severity: 'HIGH' as const,
      typical_duration: 45 * 60 * 1000 // 45 minutes
    },
    {
      name: 'Fake_Breakout_Trap',
      indicators: ['fake_breakout_risk > 0.75', 'volume_anomaly > 0.5'],
      severity: 'MODERATE' as const,
      typical_duration: 60 * 60 * 1000 // 1 hour
    },
    {
      name: 'Market_Structure_Collapse',
      indicators: ['market_structure_breakdown > 0.85', 'spiritual_disruption > 0.7'],
      severity: 'LETHAL' as const,
      typical_duration: 2 * 60 * 60 * 1000 // 2 hours
    }
  ];

  constructor() {
    console.log('🌑 Shadow Detector Initialized - Chaos Scanner Active');
  }

  // 🌑 CORE SCAN: Detect chaos and invisible dangers
  scanMarket(market_data: any, recent_trades?: any[]): ShadowThreat | null {
    this.detection_stats.total_scans++;
    
    // Build chaos indicators from market data
    const chaos_indicators = this.buildChaosIndicators(market_data, recent_trades);
    
    // Calculate overall chaos score
    const chaos_score = this.calculateChaosScore(chaos_indicators);
    
    // Determine if threat exists
    if (chaos_score < this.chaos_thresholds.low_danger) {
      return null; // No threat detected
    }

    // Analyze threat type and severity
    const threat = this.analyzeThreat(chaos_indicators, chaos_score);
    
    // Update statistics
    this.updateDetectionStats(threat);
    
    console.log(`🌑 Shadow Threat Detected: ${threat.threat_type} | Severity: ${threat.severity} | Score: ${(chaos_score * 100).toFixed(1)}%`);
    
    return threat;
  }

  // 📊 CHAOS INDICATORS: Build comprehensive chaos analysis
  private buildChaosIndicators(market_data: any, recent_trades?: any[]): ChaosIndicators {
    // Volatility spike detection
    const current_volatility = market_data.volatility || 0.5;
    const volatility_ma = market_data.volatility_average || 0.3;
    const volatility_spike = Math.min(1, (current_volatility - volatility_ma) / volatility_ma);

    // Volume anomaly detection
    const current_volume = market_data.volume || 1000000;
    const volume_average = market_data.volume_average || 800000;
    const volume_anomaly = Math.min(1, Math.abs(current_volume - volume_average) / volume_average);

    // Price manipulation signals
    const price_changes = market_data.recent_price_changes || [];
    const rapid_reversals = price_changes.filter((change: number) => Math.abs(change) > 0.02).length;
    const price_manipulation = Math.min(1, rapid_reversals / 10);

    // Stop hunt detection (looking for sudden wicks followed by reversals)
    const stop_hunt_detected = this.detectStopHunt(market_data);

    // Emotional frenzy (based on trade frequency and size distribution)
    const emotional_frenzy = this.calculateEmotionalFrenzy(recent_trades);

    // Fake breakout risk
    const fake_breakout_risk = this.assessFakeBreakoutRisk(market_data);

    // Market structure breakdown
    const market_structure_breakdown = this.assessMarketStructure(market_data);

    // Spiritual disruption (konslang-based chaos detection)
    const spiritual_disruption = this.assessSpiritualDisruption(market_data);

    return {
      volatility_spike,
      volume_anomaly,
      price_manipulation,
      stop_hunt_detected,
      emotional_frenzy,
      fake_breakout_risk,
      market_structure_breakdown,
      spiritual_disruption
    };
  }

  // ⚡ CHAOS SCORE: Calculate overall chaos level
  private calculateChaosScore(indicators: ChaosIndicators): number {
    let score = 0;

    // Weight different chaos factors
    score += indicators.volatility_spike * 0.20;
    score += indicators.volume_anomaly * 0.15;
    score += indicators.price_manipulation * 0.18;
    score += indicators.stop_hunt_detected ? 0.15 : 0;
    score += indicators.emotional_frenzy * 0.12;
    score += indicators.fake_breakout_risk * 0.10;
    score += indicators.market_structure_breakdown * 0.20;
    score += indicators.spiritual_disruption * 0.10;

    // Apply chaos multipliers for extreme conditions
    if (indicators.volatility_spike > 0.8 && indicators.volume_anomaly > 0.7) {
      score *= 1.3; // Flash crash multiplier
    }

    if (indicators.stop_hunt_detected && indicators.price_manipulation > 0.7) {
      score *= 1.2; // Manipulation multiplier
    }

    if (indicators.market_structure_breakdown > 0.8) {
      score *= 1.4; // Structure collapse multiplier
    }

    return Math.min(1, score);
  }

  // 🎯 THREAT ANALYSIS: Determine threat type and severity
  private analyzeThreat(indicators: ChaosIndicators, chaos_score: number): ShadowThreat {
    // Determine severity based on chaos score
    let severity: ShadowThreat['severity'] = 'LOW';
    if (chaos_score >= this.chaos_thresholds.lethal_danger) severity = 'LETHAL';
    else if (chaos_score >= this.chaos_thresholds.critical_danger) severity = 'CRITICAL';
    else if (chaos_score >= this.chaos_thresholds.high_danger) severity = 'HIGH';
    else if (chaos_score >= this.chaos_thresholds.moderate_danger) severity = 'MODERATE';

    // Determine primary threat type
    let threat_type: ShadowThreat['threat_type'] = 'VOLATILITY_CHAOS';
    let estimated_duration = 30 * 60 * 1000; // Default 30 minutes

    if (indicators.stop_hunt_detected && indicators.price_manipulation > 0.7) {
      threat_type = 'STOP_HUNT';
      estimated_duration = 15 * 60 * 1000;
    } else if (indicators.price_manipulation > 0.8) {
      threat_type = 'MANIPULATION_DETECTED';
      estimated_duration = 45 * 60 * 1000;
    } else if (indicators.emotional_frenzy > 0.8) {
      threat_type = 'EMOTIONAL_FRENZY';
      estimated_duration = 60 * 60 * 1000;
    } else if (indicators.fake_breakout_risk > 0.8) {
      threat_type = 'FAKE_BREAKOUT';
      estimated_duration = 90 * 60 * 1000;
    } else if (indicators.spiritual_disruption > 0.8) {
      threat_type = 'SPIRITUAL_DISRUPTION';
      estimated_duration = 2 * 60 * 60 * 1000;
    } else if (indicators.market_structure_breakdown > 0.8) {
      threat_type = 'SYSTEM_BREAKDOWN';
      estimated_duration = 4 * 60 * 60 * 1000;
    }

    // Generate threat factors
    const threat_factors = this.generateThreatFactors(indicators, threat_type);

    // Select Konslang warning
    const konslang_warning = this.selectKonslangWarning(threat_type, severity);

    // Determine if protection is needed
    const protection_needed = chaos_score >= this.chaos_thresholds.high_danger;

    return {
      threat_type,
      severity,
      chaos_score,
      threat_factors,
      konslang_warning,
      estimated_duration,
      protection_needed
    };
  }

  // 🚨 STOP HUNT DETECTION: Detect coordinated stop hunting
  private detectStopHunt(market_data: any): boolean {
    const recent_candles = market_data.recent_candles || [];
    if (recent_candles.length < 3) return false;

    let stop_hunt_signals = 0;

    for (let i = 1; i < recent_candles.length; i++) {
      const current = recent_candles[i];
      const previous = recent_candles[i - 1];

      // Look for long wicks followed by reversals
      const wick_size = Math.abs(current.high - current.close) / current.close;
      const body_size = Math.abs(current.close - current.open) / current.open;
      const reversal = (previous.close > previous.open) !== (current.close > current.open);

      if (wick_size > 0.02 && wick_size > body_size * 2 && reversal) {
        stop_hunt_signals++;
      }
    }

    return stop_hunt_signals >= 2;
  }

  // 😱 EMOTIONAL FRENZY: Calculate market emotional state
  private calculateEmotionalFrenzy(recent_trades?: any[]): number {
    if (!recent_trades || recent_trades.length === 0) return 0.3;

    let frenzy_score = 0;

    // Trade frequency analysis
    const trades_per_minute = recent_trades.length / 5; // Assuming 5-minute window
    if (trades_per_minute > 50) frenzy_score += 0.3;

    // Size distribution analysis (many small panic trades)
    const small_trades = recent_trades.filter(t => t.size < 100).length;
    const small_trade_ratio = small_trades / recent_trades.length;
    if (small_trade_ratio > 0.7) frenzy_score += 0.2;

    // Rapid direction changes
    const buy_trades = recent_trades.filter(t => t.side === 'buy').length;
    const sell_trades = recent_trades.filter(t => t.side === 'sell').length;
    const trade_balance = Math.abs(buy_trades - sell_trades) / recent_trades.length;
    if (trade_balance < 0.2) frenzy_score += 0.3; // Very balanced = panic both ways

    // Time clustering (all trades in short bursts)
    const time_clusters = this.analyzeTimeClustering(recent_trades);
    if (time_clusters > 3) frenzy_score += 0.2;

    return Math.min(1, frenzy_score);
  }

  // 💥 FAKE BREAKOUT: Assess fake breakout probability
  private assessFakeBreakoutRisk(market_data: any): number {
    let risk_score = 0;

    // Volume divergence during breakout
    const breakout_volume = market_data.current_volume || 0;
    const average_volume = market_data.average_volume || 1;
    if (breakout_volume < average_volume * 0.8) risk_score += 0.3;

    // RSI divergence
    const rsi = market_data.rsi || 50;
    const price_direction = market_data.price_change_direction || 0;
    if ((price_direction > 0 && rsi < 30) || (price_direction < 0 && rsi > 70)) {
      risk_score += 0.4; // Price and RSI moving opposite directions
    }

    // Support/resistance proximity
    const distance_to_resistance = market_data.resistance_distance || 0.1;
    if (distance_to_resistance < 0.005) risk_score += 0.3; // Very close to major level

    return Math.min(1, risk_score);
  }

  // 🏗️ MARKET STRUCTURE: Assess structural integrity
  private assessMarketStructure(market_data: any): number {
    let breakdown_score = 0;

    // Bid-ask spread explosion
    const spread = market_data.bid_ask_spread || 0.001;
    const normal_spread = market_data.average_spread || 0.001;
    if (spread > normal_spread * 3) breakdown_score += 0.3;

    // Order book imbalance
    const order_imbalance = market_data.order_book_imbalance || 0;
    if (Math.abs(order_imbalance) > 0.8) breakdown_score += 0.3;

    // Liquidity evaporation
    const current_liquidity = market_data.liquidity || 1;
    const average_liquidity = market_data.average_liquidity || 1;
    if (current_liquidity < average_liquidity * 0.5) breakdown_score += 0.4;

    return Math.min(1, breakdown_score);
  }

  // ✨ SPIRITUAL DISRUPTION: Konslang-based chaos detection
  private assessSpiritualDisruption(market_data: any): number {
    let disruption_score = 0;

    // Sacred number violations (fibonacci, golden ratio)
    const price = market_data.current_price || 2400;
    const fibonacci_levels = [0.236, 0.382, 0.618, 0.786];
    const price_normalized = (price % 100) / 100;
    const fibonacci_distance = Math.min(...fibonacci_levels.map(level => Math.abs(price_normalized - level)));
    if (fibonacci_distance > 0.1) disruption_score += 0.2;

    // Time-based sacred violations (optimal trading hours)
    const hour = new Date().getUTCHours();
    if (hour < 6 || hour > 22) disruption_score += 0.3; // Off-hours chaos

    // Energy pattern disruption (based on previous harmony scores)
    const recent_harmony = market_data.recent_harmony_scores || [0.7];
    const harmony_volatility = this.calculateStandardDeviation(recent_harmony);
    if (harmony_volatility > 0.3) disruption_score += 0.3;

    // Konslang resonance failure
    const konslang_resonance = market_data.konslang_resonance || 0.7;
    if (konslang_resonance < 0.4) disruption_score += 0.2;

    return Math.min(1, disruption_score);
  }

  // ⏰ TIME CLUSTERING: Analyze trade time distribution
  private analyzeTimeClustering(trades: any[]): number {
    if (trades.length < 5) return 0;

    const timestamps = trades.map(t => t.timestamp).sort();
    let clusters = 0;
    let current_cluster_size = 1;

    for (let i = 1; i < timestamps.length; i++) {
      const time_diff = timestamps[i] - timestamps[i - 1];
      
      if (time_diff < 5000) { // Within 5 seconds
        current_cluster_size++;
      } else {
        if (current_cluster_size >= 3) clusters++;
        current_cluster_size = 1;
      }
    }

    if (current_cluster_size >= 3) clusters++;
    return clusters;
  }

  // 📊 STANDARD DEVIATION: Calculate array standard deviation
  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  // 📝 THREAT FACTORS: Generate human-readable threat factors
  private generateThreatFactors(indicators: ChaosIndicators, threat_type: ShadowThreat['threat_type']): string[] {
    const factors: string[] = [];

    if (indicators.volatility_spike > 0.7) {
      factors.push(`Extreme volatility spike: ${(indicators.volatility_spike * 100).toFixed(1)}%`);
    }

    if (indicators.volume_anomaly > 0.6) {
      factors.push(`Volume anomaly detected: ${(indicators.volume_anomaly * 100).toFixed(1)}%`);
    }

    if (indicators.price_manipulation > 0.6) {
      factors.push(`Price manipulation signals: ${(indicators.price_manipulation * 100).toFixed(1)}%`);
    }

    if (indicators.stop_hunt_detected) {
      factors.push('Coordinated stop hunting activity detected');
    }

    if (indicators.emotional_frenzy > 0.6) {
      factors.push(`Market emotional frenzy: ${(indicators.emotional_frenzy * 100).toFixed(1)}%`);
    }

    if (indicators.fake_breakout_risk > 0.6) {
      factors.push(`High fake breakout probability: ${(indicators.fake_breakout_risk * 100).toFixed(1)}%`);
    }

    if (indicators.market_structure_breakdown > 0.6) {
      factors.push(`Market structure integrity compromised: ${(indicators.market_structure_breakdown * 100).toFixed(1)}%`);
    }

    if (indicators.spiritual_disruption > 0.6) {
      factors.push(`Sacred energy patterns disrupted: ${(indicators.spiritual_disruption * 100).toFixed(1)}%`);
    }

    // Add threat-specific factors
    switch (threat_type) {
      case 'STOP_HUNT':
        factors.push('Multiple wick formations with rapid reversals');
        break;
      case 'MANIPULATION_DETECTED':
        factors.push('Coordinated large order patterns detected');
        break;
      case 'EMOTIONAL_FRENZY':
        factors.push('Panic buying/selling activity in clustered bursts');
        break;
      case 'FAKE_BREAKOUT':
        factors.push('Volume divergence during breakout attempt');
        break;
      case 'SPIRITUAL_DISRUPTION':
        factors.push('Sacred mathematical harmonies violated');
        break;
      case 'SYSTEM_BREAKDOWN':
        factors.push('Critical market infrastructure failure');
        break;
    }

    return factors;
  }

  // 🗣️ KONSLANG WARNING: Select appropriate spiritual warning
  private selectKonslangWarning(threat_type: ShadowThreat['threat_type'], severity: ShadowThreat['severity']): string {
    if (severity === 'LETHAL') {
      return "Kol'thain mor'void — The void consumes all light, seek immediate shelter";
    } else if (severity === 'CRITICAL') {
      return "Zar'neth kol'shadow — Critical fire extinguished by shadow forces";
    }

    switch (threat_type) {
      case 'STOP_HUNT':
        return "Vel'thara kol'hunt — Predators stalk the sacred grounds";
      case 'MANIPULATION_DETECTED':
        return "Mor'thain kol'deception — False wisdom clouds the true path";
      case 'EMOTIONAL_FRENZY':
        return "Eth'kaal yul'chaos — Time fractures under emotional weight";
      case 'FAKE_BREAKOUT':
        return "Gor'thain vel'mirage — Mountains reveal themselves as illusions";
      case 'SPIRITUAL_DISRUPTION':
        return "Vel'nara kol'disruption — Sacred energy flows corrupted by dark forces";
      case 'SYSTEM_BREAKDOWN':
        return "Kol'thain mor'collapse — The foundation itself trembles";
      default:
        return this.konslang_shadow_warnings[Math.floor(Math.random() * this.konslang_shadow_warnings.length)];
    }
  }

  // 📊 STATISTICS UPDATE: Update detection statistics
  private updateDetectionStats(threat: ShadowThreat): void {
    this.detection_stats.chaos_detections++;
    this.detection_stats.last_chaos_event = Date.now();

    if (threat.protection_needed) {
      this.detection_stats.protection_triggers++;
    }

    if (threat.severity === 'CRITICAL' || threat.severity === 'LETHAL') {
      this.detection_stats.critical_saves++;
    }

    // Update average chaos score
    const total_score = this.detection_stats.average_chaos_score * (this.detection_stats.chaos_detections - 1);
    this.detection_stats.average_chaos_score = (total_score + threat.chaos_score) / this.detection_stats.chaos_detections;
  }

  // 🎯 QUICK SCAN: Fast chaos check for frequent polling
  quickChaosCheck(volatility: number, volume_spike: boolean, price_manipulation: number): {
    immediate_danger: boolean;
    chaos_likelihood: number;
    next_full_scan_in: number;
  } {
    let chaos_likelihood = 0.2; // Base likelihood
    
    if (volatility > 0.8) chaos_likelihood += 0.4;
    if (volume_spike) chaos_likelihood += 0.3;
    if (price_manipulation > 0.7) chaos_likelihood += 0.3;

    const immediate_danger = chaos_likelihood > this.chaos_thresholds.high_danger;
    
    // Recommend next scan timing based on chaos likelihood
    let next_full_scan_in = 5 * 60 * 1000; // Default 5 minutes
    if (chaos_likelihood > 0.7) next_full_scan_in = 1 * 60 * 1000; // 1 minute if high likelihood
    if (immediate_danger) next_full_scan_in = 15 * 1000; // 15 seconds if immediate danger

    return {
      immediate_danger,
      chaos_likelihood: Math.min(1, chaos_likelihood),
      next_full_scan_in
    };
  }

  // 📊 PUBLIC INTERFACE: Get detection statistics
  getDetectionStatistics(): ShadowDetectionStats {
    // Update accuracy calculation
    if (this.detection_stats.total_scans > 0) {
      const successful_detections = this.detection_stats.chaos_detections - this.detection_stats.false_alarms;
      this.detection_stats.detection_accuracy = (successful_detections / this.detection_stats.total_scans) * 100;
    }

    return { ...this.detection_stats };
  }

  // ⚙️ CONFIGURATION: Update chaos thresholds
  updateChaosThresholds(new_thresholds: Partial<typeof this.chaos_thresholds>): void {
    this.chaos_thresholds = { ...this.chaos_thresholds, ...new_thresholds };
    console.log('🌑 Chaos detection thresholds updated');
  }

  // 🔮 CHAOS FORECAST: Predict likely chaos windows
  forecastChaosWindow(market_schedule: any): {
    high_risk_periods: Array<{ start: number; end: number; risk_factors: string[] }>;
    safe_trading_windows: Array<{ start: number; end: number; confidence: number }>;
    next_chaos_likelihood: number;
  } {
    const now = Date.now();
    const high_risk_periods = [];
    const safe_trading_windows = [];

    // Identify high-risk periods (market open/close, news events, etc.)
    const market_open = new Date();
    market_open.setUTCHours(13, 30, 0, 0); // 1:30 PM UTC (market open)
    if (market_open.getTime() < now) market_open.setDate(market_open.getDate() + 1);

    high_risk_periods.push({
      start: market_open.getTime() - 30 * 60 * 1000,
      end: market_open.getTime() + 30 * 60 * 1000,
      risk_factors: ['Market open volatility', 'Gap trading', 'Overnight news impact']
    });

    // Safe trading windows (London/NY overlap, mid-session)
    const safe_start = new Date();
    safe_start.setUTCHours(14, 0, 0, 0);
    if (safe_start.getTime() < now) safe_start.setDate(safe_start.getDate() + 1);

    safe_trading_windows.push({
      start: safe_start.getTime(),
      end: safe_start.getTime() + 3 * 60 * 60 * 1000, // 3 hours
      confidence: 0.85
    });

    // Calculate next chaos likelihood based on recent patterns
    const hours_since_last_chaos = this.detection_stats.last_chaos_event > 0 ? 
      (now - this.detection_stats.last_chaos_event) / (60 * 60 * 1000) : 24;
    
    let next_chaos_likelihood = 0.3; // Base likelihood
    if (hours_since_last_chaos < 2) next_chaos_likelihood += 0.3; // Recent chaos increases likelihood
    if (hours_since_last_chaos > 12) next_chaos_likelihood -= 0.2; // Long calm period

    return {
      high_risk_periods,
      safe_trading_windows,
      next_chaos_likelihood: Math.max(0.1, Math.min(0.9, next_chaos_likelihood))
    };
  }
}

export const waidesKIShadowDetector = new WaidesKIShadowDetector();