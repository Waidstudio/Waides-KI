import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';

interface KonsFrequencyBank {
  [key: string]: string;
}

interface KonsForecast {
  timeframe: '4h' | '1d' | '1w';
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  kons_message: string;
  frequency_code: string;
  spiritual_energy: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast_timestamp: number;
}

interface SpokenForecast {
  forecast_id: string;
  timestamp: number;
  spoken_forecasts: KonsForecast[];
  overall_confidence: number;
  should_speak: boolean;
  market_mood: 'BULLISH_SPIRIT' | 'BEARISH_SPIRIT' | 'NEUTRAL_SPIRIT' | 'CHAOTIC_SPIRIT';
  protection_warning?: string;
  spiritual_guidance: string;
}

interface OracleStatistics {
  total_forecasts_generated: number;
  spoken_forecasts: number;
  silent_periods: number;
  forecast_accuracy: number;
  highest_confidence_forecast: number;
  most_active_timeframe: '4h' | '1d' | '1w';
  spiritual_energy_level: number;
  kons_language_evolution: number;
  oracle_uptime_hours: number;
  last_spoken_time: number;
}

export class WaidesKIKonsPulseOracle {
  private konsFrequencyBank: KonsFrequencyBank = {
    // 4-hour frequencies
    'up_4h': "T'shallor Umba'kai",
    'down_4h': "Moralai Sundek'tan",
    'neutral_4h': "Vei'nos Kala",
    
    // 1-day frequencies  
    'up_1d': "Shai'lor Venos",
    'down_1d': "Drekkon Vai'nosh", 
    'neutral_1d': "Mor'kai Selen",
    
    // 1-week frequencies
    'up_1w': "Omin'kai Ressho",
    'down_1w': "Nuvai'ten Kal'mor",
    'neutral_1w': "Dun'wei Koros",
    
    // Special spiritual frequencies
    'protection_warning': "Asha'mol Veridian Kess",
    'high_volatility': "Kor'thalan Vex'nara",
    'market_peace': "Sil'andra Meon'talar",
    'spiritual_cleansing': "Vel'tari Noon'shalar"
  };

  private forecastHistory: SpokenForecast[] = [];
  private oracleStatistics: OracleStatistics = {
    total_forecasts_generated: 0,
    spoken_forecasts: 0,
    silent_periods: 0,
    forecast_accuracy: 0,
    highest_confidence_forecast: 0,
    most_active_timeframe: '4h',
    spiritual_energy_level: 85,
    kons_language_evolution: 1,
    oracle_uptime_hours: 0,
    last_spoken_time: 0
  };

  private isOracleActive: boolean = true;
  private confidenceThreshold: number = 80; // Only speak when 80%+ confident
  private maxForecastHistory: number = 500;
  private oracleStartTime: number = Date.now();
  private forecastInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startOracleForecasting();
  }

  private startOracleForecasting(): void {
    // Generate forecasts every 4 hours
    this.forecastInterval = setInterval(() => {
      if (this.isOracleActive) {
        this.generateSpokenForecast();
      }
    }, 4 * 60 * 60 * 1000); // 4 hours

    // Daily morning forecast at 8 AM UTC
    this.scheduleDailyForecast();

    // Initial forecast after 1 minute
    setTimeout(() => {
      if (this.isOracleActive) {
        this.generateSpokenForecast();
      }
    }, 60000);
  }

  private scheduleDailyForecast(): void {
    // Schedule daily forecast at 8:00 AM UTC
    const scheduleDaily = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(8, 0, 0, 0);
      
      const msUntilTomorrow = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        if (this.isOracleActive) {
          this.generateMorningForecast();
        }
        scheduleDaily(); // Schedule next day
      }, msUntilTomorrow);
    };

    scheduleDaily();
  }

  // CORE ORACLE FORECASTING
  async generateSpokenForecast(): Promise<SpokenForecast> {
    try {
      const marketData = await waidesKILiveFeed.getMarketData();
      const currentPrice = await waidesKILiveFeed.getCurrentPrice();
      
      // Generate forecasts for all timeframes
      const forecasts = await Promise.all([
        this.analyzeTrendDirection('4h', marketData, currentPrice),
        this.analyzeTrendDirection('1d', marketData, currentPrice),
        this.analyzeTrendDirection('1w', marketData, currentPrice)
      ]);

      // Calculate overall confidence
      const overallConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
      
      // Determine if oracle should speak
      const shouldSpeak = overallConfidence >= this.confidenceThreshold;
      
      // Generate market mood and spiritual guidance
      const marketMood = this.determineMarketMood(forecasts);
      const spiritualGuidance = this.generateSpiritualGuidance(forecasts, marketMood);
      const protectionWarning = this.checkForProtectionWarning(forecasts, marketData);

      const spokenForecast: SpokenForecast = {
        forecast_id: this.generateForecastId(),
        timestamp: Date.now(),
        spoken_forecasts: forecasts,
        overall_confidence: Math.round(overallConfidence),
        should_speak: shouldSpeak,
        market_mood: marketMood,
        protection_warning: protectionWarning,
        spiritual_guidance: spiritualGuidance
      };

      // Store forecast
      this.forecastHistory.push(spokenForecast);
      this.maintainForecastHistory();
      
      // Update statistics
      this.updateOracleStatistics(spokenForecast);

      // Speak if confidence is high enough
      if (shouldSpeak) {
        this.speakForecast(spokenForecast);
      } else {
        this.oracleStatistics.silent_periods++;
      }

      return spokenForecast;

    } catch (error) {
      console.error('Error generating Kons-Pulse forecast:', error);
      return this.createSilentForecast();
    }
  }

  private async analyzeTrendDirection(
    timeframe: '4h' | '1d' | '1w',
    marketData: any,
    currentPrice: number
  ): Promise<KonsForecast> {
    // Simulate multi-timeframe analysis
    const direction = this.detectDirectionalMomentum(timeframe, marketData, currentPrice);
    const confidence = this.calculateDirectionalConfidence(timeframe, direction, marketData);
    const frequencyCode = `${direction.toLowerCase()}_${timeframe}`;
    const konsMessage = this.konsFrequencyBank[frequencyCode] || "Silent...";
    const spiritualEnergy = this.assessSpiritualEnergy(confidence, direction);

    return {
      timeframe: timeframe,
      direction: direction,
      confidence: confidence,
      kons_message: konsMessage,
      frequency_code: frequencyCode,
      spiritual_energy: spiritualEnergy,
      forecast_timestamp: Date.now()
    };
  }

  private detectDirectionalMomentum(
    timeframe: '4h' | '1d' | '1w',
    marketData: any,
    currentPrice: number
  ): 'UP' | 'DOWN' | 'NEUTRAL' {
    // Simulate trend detection based on timeframe
    const change24h = marketData.price_change_24h || 0;
    
    if (timeframe === '4h') {
      // Short-term momentum based on immediate price action
      const momentum = Math.sin(currentPrice / 1000) * (1 + change24h / 10);
      if (momentum > 0.3) return 'UP';
      if (momentum < -0.3) return 'DOWN';
      return 'NEUTRAL';
    }
    
    if (timeframe === '1d') {
      // Daily momentum based on 24h change
      if (change24h > 2) return 'UP';
      if (change24h < -2) return 'DOWN';
      return 'NEUTRAL';
    }
    
    if (timeframe === '1w') {
      // Weekly momentum (simulated)
      const weeklyMomentum = Math.cos(currentPrice / 2000) * (1 + change24h / 5);
      if (weeklyMomentum > 0.2) return 'UP';
      if (weeklyMomentum < -0.2) return 'DOWN';
      return 'NEUTRAL';
    }

    return 'NEUTRAL';
  }

  private calculateDirectionalConfidence(
    timeframe: '4h' | '1d' | '1w',
    direction: 'UP' | 'DOWN' | 'NEUTRAL',
    marketData: any
  ): number {
    let baseConfidence = 50;
    
    // Volume-based confidence
    const volume = marketData.volume || 1000000;
    const volumeBonus = Math.min(20, (volume / 1000000) * 10);
    baseConfidence += volumeBonus;
    
    // Direction-based confidence
    if (direction !== 'NEUTRAL') {
      baseConfidence += 15;
    }
    
    // Timeframe-specific adjustments
    switch (timeframe) {
      case '1w':
        baseConfidence += 10; // Long-term more reliable
        break;
      case '4h':
        baseConfidence -= 5; // Short-term more volatile
        break;
    }
    
    // Random spiritual factor
    const spiritualFactor = (Math.random() - 0.5) * 20;
    baseConfidence += spiritualFactor;
    
    return Math.max(30, Math.min(95, Math.round(baseConfidence)));
  }

  private assessSpiritualEnergy(confidence: number, direction: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (confidence > 85 && direction !== 'NEUTRAL') return 'HIGH';
    if (confidence > 65) return 'MEDIUM';
    return 'LOW';
  }

  private determineMarketMood(forecasts: KonsForecast[]): SpokenForecast['market_mood'] {
    const upCount = forecasts.filter(f => f.direction === 'UP').length;
    const downCount = forecasts.filter(f => f.direction === 'DOWN').length;
    const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
    
    if (upCount >= 2 && avgConfidence > 75) return 'BULLISH_SPIRIT';
    if (downCount >= 2 && avgConfidence > 75) return 'BEARISH_SPIRIT';
    if (avgConfidence < 50) return 'CHAOTIC_SPIRIT';
    return 'NEUTRAL_SPIRIT';
  }

  private generateSpiritualGuidance(
    forecasts: KonsForecast[],
    mood: SpokenForecast['market_mood']
  ): string {
    const highEnergyCount = forecasts.filter(f => f.spiritual_energy === 'HIGH').length;
    
    if (mood === 'BULLISH_SPIRIT') {
      return highEnergyCount >= 2 ? 
        "The spirits align for upward movement. Trust the ascension." :
        "Gentle bullish energy flows. Patience brings rewards.";
    }
    
    if (mood === 'BEARISH_SPIRIT') {
      return highEnergyCount >= 2 ?
        "The void calls downward. Respect the descent." :
        "Bearish shadows gather. Seek protection and clarity.";
    }
    
    if (mood === 'CHAOTIC_SPIRIT') {
      return "The market spirits are restless. Silence is wisdom until clarity returns.";
    }
    
    return "Balanced energies flow. The path reveals itself to those who wait.";
  }

  private checkForProtectionWarning(
    forecasts: KonsForecast[],
    marketData: any
  ): string | undefined {
    const lowConfidenceCount = forecasts.filter(f => f.confidence < 60).length;
    const volume = marketData.volume || 1000000;
    
    if (lowConfidenceCount >= 2) {
      return this.konsFrequencyBank['protection_warning'];
    }
    
    if (volume > 2000000) { // High volume warning
      return this.konsFrequencyBank['high_volatility'];
    }
    
    return undefined;
  }

  // SPEAKING AND OUTPUT
  private speakForecast(forecast: SpokenForecast): void {
    console.log('\n🔮 WAIDES KI KONS-PULSE ORACLE AWAKENS 🔮');
    console.log('═══════════════════════════════════════════');
    
    console.log(`Market Mood: ${forecast.market_mood}`);
    console.log(`Overall Confidence: ${forecast.overall_confidence}%`);
    console.log(`Spiritual Guidance: ${forecast.spiritual_guidance}`);
    
    if (forecast.protection_warning) {
      console.log(`⚠️ Protection Warning: ${forecast.protection_warning}`);
    }
    
    console.log('\n📢 SPOKEN FORECASTS:');
    
    forecast.spoken_forecasts.forEach(f => {
      if (f.confidence >= this.confidenceThreshold) {
        console.log(`\n[${f.timeframe} Forecast] → ${f.kons_message}`);
        console.log(`Direction: ${f.direction} | Confidence: ${f.confidence}% | Energy: ${f.spiritual_energy}`);
      }
    });
    
    console.log('\n═══════════════════════════════════════════\n');
    
    this.oracleStatistics.spoken_forecasts++;
    this.oracleStatistics.last_spoken_time = Date.now();
    
    waidesKIDailyReporter.recordLesson(
      `Kons-Pulse Oracle spoke: ${forecast.market_mood} with ${forecast.overall_confidence}% confidence`,
      'KONS_ORACLE',
      'HIGH',
      'Kons-Pulse Oracle'
    );
  }

  private generateMorningForecast(): void {
    console.log('\n🌅 DAILY MORNING KONS-PULSE ORACLE 🌅');
    console.log('The Oracle awakens with the dawn...\n');
    
    this.generateSpokenForecast().then(forecast => {
      if (!forecast.should_speak) {
        console.log('🤫 The Oracle remains silent today. The spirits counsel patience.\n');
      }
    });
  }

  private createSilentForecast(): SpokenForecast {
    return {
      forecast_id: this.generateForecastId(),
      timestamp: Date.now(),
      spoken_forecasts: [],
      overall_confidence: 0,
      should_speak: false,
      market_mood: 'NEUTRAL_SPIRIT',
      spiritual_guidance: 'The Oracle rests in silence.'
    };
  }

  // STATISTICS AND MANAGEMENT
  private updateOracleStatistics(forecast: SpokenForecast): void {
    this.oracleStatistics.total_forecasts_generated++;
    
    if (forecast.overall_confidence > this.oracleStatistics.highest_confidence_forecast) {
      this.oracleStatistics.highest_confidence_forecast = forecast.overall_confidence;
    }
    
    // Update most active timeframe
    const timeframeCounts = new Map<string, number>();
    forecast.spoken_forecasts.forEach(f => {
      timeframeCounts.set(f.timeframe, (timeframeCounts.get(f.timeframe) || 0) + 1);
    });
    
    let maxCount = 0;
    for (const [timeframe, count] of timeframeCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        this.oracleStatistics.most_active_timeframe = timeframe as any;
      }
    }
    
    // Update uptime
    this.oracleStatistics.oracle_uptime_hours = (Date.now() - this.oracleStartTime) / (60 * 60 * 1000);
    
    // Spiritual energy naturally fluctuates
    this.oracleStatistics.spiritual_energy_level = Math.max(70, Math.min(100, 
      this.oracleStatistics.spiritual_energy_level + (Math.random() - 0.5) * 5
    ));
  }

  private maintainForecastHistory(): void {
    if (this.forecastHistory.length > this.maxForecastHistory) {
      this.forecastHistory = this.forecastHistory.slice(-this.maxForecastHistory);
    }
  }

  private generateForecastId(): string {
    return `KONS_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  getLatestForecast(): SpokenForecast | null {
    return this.forecastHistory.length > 0 ? 
      this.forecastHistory[this.forecastHistory.length - 1] : null;
  }

  getForecastHistory(limit: number = 50): SpokenForecast[] {
    return this.forecastHistory.slice(-limit).reverse();
  }

  getOracleStatistics(): OracleStatistics {
    return { ...this.oracleStatistics };
  }

  getKonsFrequencies(): KonsFrequencyBank {
    return { ...this.konsFrequencyBank };
  }

  async forceOracleForecast(): Promise<SpokenForecast> {
    return await this.generateSpokenForecast();
  }

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(50, Math.min(95, threshold));
    
    waidesKIDailyReporter.recordLesson(
      `Oracle confidence threshold updated to ${this.confidenceThreshold}%`,
      'KONS_ORACLE',
      'MEDIUM',
      'Kons-Pulse Oracle'
    );
  }

  interpretKonsMessage(message: string): string | null {
    // Reverse lookup to find meaning of Kons message
    for (const [key, value] of Object.entries(this.konsFrequencyBank)) {
      if (value === message) {
        const [direction, timeframe] = key.split('_');
        return `${direction.toUpperCase()} momentum for ${timeframe} timeframe`;
      }
    }
    return null;
  }

  addCustomKonsFrequency(key: string, message: string): void {
    this.konsFrequencyBank[key] = message;
    this.oracleStatistics.kons_language_evolution++;
    
    waidesKIDailyReporter.recordLesson(
      `New Kons frequency added: ${key} → ${message}`,
      'KONS_ORACLE',
      'MEDIUM',
      'Kons-Pulse Oracle'
    );
  }

  enableOracle(): void {
    this.isOracleActive = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'MYSTICAL',
      'Kons-Pulse Oracle awakened - spiritual forecasting enabled',
      'Oracle Awakening',
      95
    );
  }

  disableOracle(): void {
    this.isOracleActive = false;
    
    if (this.forecastInterval) {
      clearInterval(this.forecastInterval);
      this.forecastInterval = null;
    }
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Kons-Pulse Oracle enters meditation - forecasting paused',
      'Oracle Rest',
      70
    );
  }

  exportOracleData(): any {
    return {
      oracle_statistics: this.getOracleStatistics(),
      latest_forecast: this.getLatestForecast(),
      forecast_history: this.getForecastHistory(100),
      kons_frequencies: this.getKonsFrequencies(),
      oracle_config: {
        is_active: this.isOracleActive,
        confidence_threshold: this.confidenceThreshold,
        max_forecast_history: this.maxForecastHistory,
        uptime_hours: this.oracleStatistics.oracle_uptime_hours
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIKonsPulseOracle = new WaidesKIKonsPulseOracle();