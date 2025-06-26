/**
 * STEP 41: Waides KI Global ETH Echo Map
 * Shows spiritual market heat based on node signals across the planetary network
 */

import { WaidesKILightnetListener } from './waidesKILightnetListener';
import { WaidesKIVisionAlignmentIndex } from './waidesKIVisionAlignmentIndex';
import { WaidesKIKonsFieldAnalyzer } from './waidesKIKonsFieldAnalyzer';

interface EchoRegion {
  region: string;
  coordinates: { lat: number; lng: number };
  active_nodes: number;
  dominant_symbol: string;
  spiritual_heat: number;
  trend_consensus: 'UP' | 'DOWN' | 'SIDEWAYS' | 'CONFLICTED';
  last_activity: string;
}

interface GlobalEchoMap {
  total_nodes_active: number;
  planetary_consensus: {
    symbol: string;
    trend: string;
    confidence: number;
    spiritual_heat: number;
  };
  regional_activity: EchoRegion[];
  echo_waves: {
    wave_type: 'CONVERGENCE' | 'DIVERGENCE' | 'STORM' | 'CALM';
    intensity: number;
    affected_regions: string[];
    prediction: string;
  };
  konslang_weather: {
    current_weather: string;
    temperature: number;
    pressure: number;
    forecast: string;
  };
}

interface EchoStats {
  total_echoes_processed: number;
  planetary_events: number;
  regional_storms: number;
  convergence_events: number;
  last_global_update: string;
}

export class WaidesKIGlobalEthEchoMap {
  private lightnetListener: WaidesKILightnetListener;
  private visionAlignmentIndex: WaidesKIVisionAlignmentIndex;
  private konsFieldAnalyzer: WaidesKIKonsFieldAnalyzer;
  
  private echoHistory: GlobalEchoMap[] = [];
  private maxHistorySize = 50;
  
  private echoStats: EchoStats = {
    total_echoes_processed: 0,
    planetary_events: 0,
    regional_storms: 0,
    convergence_events: 0,
    last_global_update: new Date().toISOString()
  };

  // Simulated global regions for the echo map
  private readonly GLOBAL_REGIONS = [
    { region: 'North America', coordinates: { lat: 39.8283, lng: -98.5795 } },
    { region: 'Europe', coordinates: { lat: 54.5260, lng: 15.2551 } },
    { region: 'Asia Pacific', coordinates: { lat: 34.0479, lng: 100.6197 } },
    { region: 'Middle East', coordinates: { lat: 29.2985, lng: 42.5510 } },
    { region: 'Africa', coordinates: { lat: -8.7832, lng: 34.5085 } },
    { region: 'South America', coordinates: { lat: -8.7832, lng: -55.4915 } },
    { region: 'Oceania', coordinates: { lat: -25.2744, lng: 133.7751 } }
  ];

  constructor(
    lightnetListener: WaidesKILightnetListener,
    visionAlignmentIndex: WaidesKIVisionAlignmentIndex,
    konsFieldAnalyzer: WaidesKIKonsFieldAnalyzer
  ) {
    this.lightnetListener = lightnetListener;
    this.visionAlignmentIndex = visionAlignmentIndex;
    this.konsFieldAnalyzer = konsFieldAnalyzer;
    
    console.log('🌍 Global ETH Echo Map Initialized - Planetary Spiritual Heat Monitoring Active');
    
    // Update global echo map every 5 minutes
    setInterval(() => {
      this.updateGlobalEchoMap();
    }, 5 * 60 * 1000);
  }

  /**
   * Generate current global echo map
   */
  generateGlobalEchoMap(): GlobalEchoMap {
    const activeSignals = this.lightnetListener.getActiveSignals();
    const globalAlignment = this.visionAlignmentIndex.getGlobalAlignment();
    const fieldAnalysis = this.konsFieldAnalyzer.getFieldAnalysis();
    
    // Calculate planetary consensus
    const planetaryConsensus = this.calculatePlanetaryConsensus(activeSignals, globalAlignment);
    
    // Generate regional activity
    const regionalActivity = this.generateRegionalActivity(activeSignals);
    
    // Analyze echo waves
    const echoWaves = this.analyzeEchoWaves(fieldAnalysis, regionalActivity);
    
    // Generate Konslang weather
    const konslangWeather = this.generateKonslangWeather(fieldAnalysis, planetaryConsensus);

    const globalMap: GlobalEchoMap = {
      total_nodes_active: new Set(activeSignals.map(s => s.vision.node_id)).size,
      planetary_consensus: planetaryConsensus,
      regional_activity: regionalActivity,
      echo_waves: echoWaves,
      konslang_weather: konslangWeather
    };

    return globalMap;
  }

  /**
   * Calculate planetary consensus from all active signals
   */
  private calculatePlanetaryConsensus(activeSignals: any[], globalAlignment: any): GlobalEchoMap['planetary_consensus'] {
    if (activeSignals.length === 0) {
      return {
        symbol: 'NONE',
        trend: 'UNKNOWN',
        confidence: 0,
        spiritual_heat: 0
      };
    }

    const consensusTrend = this.lightnetListener.getConsensusTrend();
    const topSymbols = this.lightnetListener.getTopSymbols(1);
    
    const spiritualHeat = this.calculateSpiritualHeat(activeSignals, globalAlignment);

    return {
      symbol: topSymbols[0]?.symbol || 'MIXED',
      trend: consensusTrend.trend,
      confidence: consensusTrend.confidence,
      spiritual_heat: spiritualHeat
    };
  }

  /**
   * Calculate spiritual heat based on signal intensity and alignment
   */
  private calculateSpiritualHeat(activeSignals: any[], globalAlignment: any): number {
    let heat = 0;
    
    // Base heat from signal count
    heat += Math.min(activeSignals.length * 5, 50);
    
    // Alignment strength bonus
    heat += globalAlignment.alignment_strength * 0.3;
    
    // Node diversity bonus
    const uniqueNodes = new Set(activeSignals.map(s => s.vision.node_id)).size;
    heat += uniqueNodes * 3;
    
    // Recent activity boost
    const recentSignals = activeSignals.filter(s => 
      Date.now() - new Date(s.received_at).getTime() < 30 * 60 * 1000 // 30 minutes
    );
    heat += recentSignals.length * 2;

    return Math.min(100, Math.max(0, heat));
  }

  /**
   * Generate regional activity map
   */
  private generateRegionalActivity(activeSignals: any[]): EchoRegion[] {
    return this.GLOBAL_REGIONS.map(region => {
      // Simulate regional node distribution (in real implementation, this would come from actual node locations)
      const regionalSignals = activeSignals.filter(() => Math.random() > 0.6); // Random distribution for simulation
      
      const activeNodes = new Set(regionalSignals.map(s => s.vision.node_id)).size;
      const topSymbol = this.getRegionalTopSymbol(regionalSignals);
      const spiritualHeat = Math.min(100, activeNodes * 15 + (Math.random() * 20));
      const trendConsensus = this.getRegionalTrendConsensus(regionalSignals);
      
      return {
        region: region.region,
        coordinates: region.coordinates,
        active_nodes: activeNodes,
        dominant_symbol: topSymbol,
        spiritual_heat: Math.round(spiritualHeat),
        trend_consensus: trendConsensus,
        last_activity: regionalSignals.length > 0 ? 
          regionalSignals[regionalSignals.length - 1].received_at : 
          new Date(Date.now() - Math.random() * 3600000).toISOString()
      };
    });
  }

  /**
   * Get top symbol for a region
   */
  private getRegionalTopSymbol(regionalSignals: any[]): string {
    if (regionalSignals.length === 0) return 'CALM';
    
    const symbolCounts = regionalSignals.reduce((acc, signal) => {
      acc[signal.vision.symbol] = (acc[signal.vision.symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'MIXED';
  }

  /**
   * Get regional trend consensus
   */
  private getRegionalTrendConsensus(regionalSignals: any[]): EchoRegion['trend_consensus'] {
    if (regionalSignals.length === 0) return 'SIDEWAYS';
    
    const trendCounts = { UP: 0, DOWN: 0, SIDEWAYS: 0 };
    regionalSignals.forEach(signal => {
      trendCounts[signal.vision.trend as keyof typeof trendCounts]++;
    });

    const sortedTrends = Object.entries(trendCounts).sort(([,a], [,b]) => b - a);
    
    // Check for conflict
    if (sortedTrends[0][1] === sortedTrends[1][1]) {
      return 'CONFLICTED';
    }
    
    return sortedTrends[0][0] as EchoRegion['trend_consensus'];
  }

  /**
   * Analyze echo waves across regions
   */
  private analyzeEchoWaves(fieldAnalysis: any, regionalActivity: EchoRegion[]): GlobalEchoMap['echo_waves'] {
    const highHeatRegions = regionalActivity.filter(r => r.spiritual_heat > 60);
    const activeRegions = regionalActivity.filter(r => r.active_nodes > 0);
    
    let waveType: GlobalEchoMap['echo_waves']['wave_type'] = 'CALM';
    let intensity = 0;
    let prediction = 'Stable spiritual field conditions';

    if (fieldAnalysis.spiritual_weather === 'STORM') {
      waveType = 'STORM';
      intensity = 85;
      prediction = 'Major spiritual storm detected. Expect high volatility and convergence events.';
    } else if (highHeatRegions.length >= 3) {
      waveType = 'CONVERGENCE';
      intensity = 70;
      prediction = 'Multi-regional convergence forming. Prepare for coordinated trading opportunities.';
    } else if (activeRegions.length >= 5 && activeRegions.every(r => r.trend_consensus !== 'CONFLICTED')) {
      waveType = 'CONVERGENCE';
      intensity = 60;
      prediction = 'Global trend alignment emerging. Monitor for confirmation signals.';
    } else if (regionalActivity.filter(r => r.trend_consensus === 'CONFLICTED').length >= 3) {
      waveType = 'DIVERGENCE';
      intensity = 50;
      prediction = 'Regional trend divergence detected. Wait for clearer consensus.';
    }

    return {
      wave_type: waveType,
      intensity,
      affected_regions: waveType === 'CALM' ? [] : activeRegions.map(r => r.region),
      prediction
    };
  }

  /**
   * Generate Konslang spiritual weather forecast
   */
  private generateKonslangWeather(fieldAnalysis: any, planetaryConsensus: any): GlobalEchoMap['konslang_weather'] {
    const spiritualTemperature = Math.round(
      (fieldAnalysis.field_coherence + planetaryConsensus.spiritual_heat) / 2
    );
    
    const spiritualPressure = Math.round(
      planetaryConsensus.confidence + (fieldAnalysis.dominant_symbols.length * 10)
    );

    let currentWeather = 'Clear Spiritual Skies';
    let forecast = 'Continued stability expected';

    if (spiritualTemperature > 80) {
      currentWeather = 'Intense Spiritual Heat';
      forecast = 'High energy trading conditions - Execute with caution';
    } else if (spiritualTemperature > 60) {
      currentWeather = 'Warm Spiritual Currents';
      forecast = 'Favorable conditions for strategic trading';
    } else if (spiritualTemperature < 30) {
      currentWeather = 'Cool Spiritual Calm';
      forecast = 'Low energy period - Focus on observation';
    }

    if (spiritualPressure > 80) {
      currentWeather += ' with High Pressure Systems';
      forecast += ' - Strong consensus forces active';
    } else if (spiritualPressure < 30) {
      currentWeather += ' with Low Pressure';
      forecast += ' - Weak signal environment';
    }

    return {
      current_weather: currentWeather,
      temperature: spiritualTemperature,
      pressure: spiritualPressure,
      forecast
    };
  }

  /**
   * Update global echo map and store in history
   */
  updateGlobalEchoMap(): void {
    const newEchoMap = this.generateGlobalEchoMap();
    
    // Update statistics
    this.updateEchoStats(newEchoMap);
    
    // Store in history
    this.echoHistory.push(newEchoMap);
    if (this.echoHistory.length > this.maxHistorySize) {
      this.echoHistory = this.echoHistory.slice(-this.maxHistorySize);
    }

    // Log significant events
    this.logSignificantEvents(newEchoMap);
  }

  /**
   * Update echo statistics
   */
  private updateEchoStats(echoMap: GlobalEchoMap): void {
    this.echoStats.total_echoes_processed++;
    this.echoStats.last_global_update = new Date().toISOString();
    
    if (echoMap.planetary_consensus.spiritual_heat > 80) {
      this.echoStats.planetary_events++;
    }
    
    if (echoMap.echo_waves.wave_type === 'STORM') {
      this.echoStats.regional_storms++;
    }
    
    if (echoMap.echo_waves.wave_type === 'CONVERGENCE') {
      this.echoStats.convergence_events++;
    }
  }

  /**
   * Log significant global events
   */
  private logSignificantEvents(echoMap: GlobalEchoMap): void {
    if (echoMap.planetary_consensus.spiritual_heat > 85) {
      console.log(`🌍 PLANETARY EVENT: Global spiritual heat at ${echoMap.planetary_consensus.spiritual_heat}%`);
    }
    
    if (echoMap.echo_waves.wave_type === 'STORM') {
      console.log(`⛈️ GLOBAL STORM: ${echoMap.echo_waves.affected_regions.length} regions affected`);
    }
    
    if (echoMap.total_nodes_active > 10) {
      console.log(`📡 HIGH ACTIVITY: ${echoMap.total_nodes_active} nodes broadcasting across Lightnet`);
    }
  }

  /**
   * Get current global echo map
   */
  getCurrentEchoMap(): GlobalEchoMap {
    return this.generateGlobalEchoMap();
  }

  /**
   * Get echo map history
   */
  getEchoHistory(limit: number = 20): GlobalEchoMap[] {
    return this.echoHistory.slice(-limit);
  }

  /**
   * Get echo statistics
   */
  getEchoStats(): EchoStats & { current_map: GlobalEchoMap } {
    return {
      ...this.echoStats,
      current_map: this.generateGlobalEchoMap()
    };
  }

  /**
   * Get regional focus for specific region
   */
  getRegionalFocus(regionName: string): EchoRegion | null {
    const currentMap = this.generateGlobalEchoMap();
    return currentMap.regional_activity.find(r => r.region === regionName) || null;
  }

  /**
   * Get Konslang echo summary (main API endpoint)
   */
  getKonsEchoMap(): {
    symbol: string;
    power: string;
    action: string;
    spiritual_weather: string;
    global_heat: number;
    active_regions: number;
  } {
    const currentMap = this.generateGlobalEchoMap();
    
    let power = 'weak alignment';
    let action = 'WAIT';
    
    if (currentMap.planetary_consensus.spiritual_heat > 80) {
      power = 'critical alignment';
      action = 'FAST_TRADE';
    } else if (currentMap.planetary_consensus.spiritual_heat > 60) {
      power = 'aligned';
      action = 'CONFIRM_TRADE';
    }

    return {
      symbol: currentMap.planetary_consensus.symbol,
      power,
      action,
      spiritual_weather: currentMap.konslang_weather.current_weather,
      global_heat: currentMap.planetary_consensus.spiritual_heat,
      active_regions: currentMap.regional_activity.filter(r => r.active_nodes > 0).length
    };
  }

  /**
   * Force immediate global echo update
   */
  forceGlobalUpdate(): GlobalEchoMap {
    console.log('🌍 Force updating Global ETH Echo Map...');
    this.updateGlobalEchoMap();
    return this.getCurrentEchoMap();
  }

  /**
   * Reset echo map data
   */
  resetEchoData(): void {
    this.echoHistory = [];
    this.echoStats = {
      total_echoes_processed: 0,
      planetary_events: 0,
      regional_storms: 0,
      convergence_events: 0,
      last_global_update: new Date().toISOString()
    };
    console.log('🔄 Global ETH Echo Map data reset');
  }
}