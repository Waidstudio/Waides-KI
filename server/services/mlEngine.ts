import { storage } from '../storage';

interface MarketFeatures {
  volatility: number;
  trend: number;
  rsi: number;
  volume: number;
  priceChange: number;
  momentum: number;
}

interface TrainingData {
  features: MarketFeatures;
  target: number;
  timestamp: number;
}

interface MLModel {
  weights: number[];
  bias: number;
  learningRate: number;
  accuracy: number;
}

export class MLEngine {
  private trendModel: MLModel;
  private volatilityModel: MLModel;
  private reversalModel: MLModel;
  private trainingData: TrainingData[] = [];
  private isTraining = false;

  constructor() {
    this.trendModel = this.initializeModel();
    this.volatilityModel = this.initializeModel();
    this.reversalModel = this.initializeModel();
    this.loadTrainingHistory();
  }

  private initializeModel(): MLModel {
    return {
      weights: Array(6).fill(0).map(() => Math.random() * 0.1 - 0.05),
      bias: 0,
      learningRate: 0.01,
      accuracy: 0
    };
  }

  private async loadTrainingHistory() {
    try {
      const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 1000);
      if (candlesticks.length > 0) {
        this.prepareTrainingData(candlesticks);
      }
    } catch (error) {
      console.error('Failed to load training history:', error);
    }
  }

  private prepareTrainingData(candlesticks: any[]) {
    for (let i = 20; i < candlesticks.length - 1; i++) {
      const current = candlesticks[i];
      const previous = candlesticks.slice(i - 20, i);
      const next = candlesticks[i + 1];

      const features = this.extractFeatures(current, previous);
      const target = next.close > current.close ? 1 : 0;

      this.trainingData.push({
        features,
        target,
        timestamp: current.openTime
      });
    }

    console.log(`🧠 Prepared ${this.trainingData.length} training samples`);
  }

  private extractFeatures(current: any, history: any[]): MarketFeatures {
    const prices = history.map(c => c.close);
    const volumes = history.map(c => c.volume);

    // Calculate technical indicators
    const sma = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = this.calculateVolatility(prices);
    const rsi = this.calculateRSI(prices);
    const priceChange = (current.close - prices[0]) / prices[0];
    const volumeChange = (current.volume - volumes[0]) / volumes[0];
    const momentum = this.calculateMomentum(prices);

    return {
      volatility,
      trend: (current.close - sma) / sma,
      rsi,
      volume: volumeChange,
      priceChange,
      momentum
    };
  }

  private calculateVolatility(prices: number[]): number {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 2) return 0;
    return (prices[prices.length - 1] - prices[0]) / prices[0];
  }

  private predict(model: MLModel, features: MarketFeatures): number {
    const inputs = [
      features.volatility,
      features.trend,
      features.rsi / 100,
      features.volume,
      features.priceChange,
      features.momentum
    ];

    let output = model.bias;
    for (let i = 0; i < inputs.length; i++) {
      output += inputs[i] * model.weights[i];
    }

    // Sigmoid activation
    return 1 / (1 + Math.exp(-output));
  }

  private trainModel(model: MLModel, data: TrainingData[]): void {
    if (data.length === 0) return;

    let totalLoss = 0;
    let correct = 0;

    for (const sample of data) {
      const prediction = this.predict(model, sample.features);
      const error = sample.target - prediction;
      totalLoss += error * error;

      if ((prediction > 0.5 && sample.target === 1) || (prediction <= 0.5 && sample.target === 0)) {
        correct++;
      }

      // Backpropagation
      const inputs = [
        sample.features.volatility,
        sample.features.trend,
        sample.features.rsi / 100,
        sample.features.volume,
        sample.features.priceChange,
        sample.features.momentum
      ];

      // Update weights
      for (let i = 0; i < model.weights.length; i++) {
        model.weights[i] += model.learningRate * error * inputs[i];
      }
      model.bias += model.learningRate * error;
    }

    model.accuracy = correct / data.length;
    console.log(`🎯 Model accuracy: ${(model.accuracy * 100).toFixed(2)}%`);
  }

  public async trainModels(): Promise<void> {
    if (this.isTraining || this.trainingData.length < 100) return;

    this.isTraining = true;
    console.log('🧠 Training ML models...');

    try {
      // Split data for different models
      const trendData = this.trainingData.filter(d => Math.abs(d.features.trend) > 0.01);
      const volatilityData = this.trainingData.filter(d => d.features.volatility > 0.02);
      const reversalData = this.trainingData.filter(d => d.features.rsi < 30 || d.features.rsi > 70);

      // Train models
      this.trainModel(this.trendModel, trendData);
      this.trainModel(this.volatilityModel, volatilityData);
      this.trainModel(this.reversalModel, reversalData);

      console.log('✅ ML models trained successfully');
    } finally {
      this.isTraining = false;
    }
  }

  public async generatePrediction(currentPrice: number): Promise<{
    trendProbability: number;
    volatilityRisk: number;
    reversalSignal: number;
    confidence: number;
    recommendation: 'BUY_ETH3L' | 'BUY_ETH3S' | 'SELL_ETH3L' | 'SELL_ETH3S' | 'HOLD';
  }> {
    // Get recent candlesticks for feature extraction
    const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 20);
    if (candlesticks.length < 20) {
      return {
        trendProbability: 0.5,
        volatilityRisk: 0.5,
        reversalSignal: 0.5,
        confidence: 0,
        recommendation: 'HOLD'
      };
    }

    const current = candlesticks[candlesticks.length - 1];
    const history = candlesticks.slice(0, -1);
    const features = this.extractFeatures(current, history);

    // Generate predictions
    const trendProbability = this.predict(this.trendModel, features);
    const volatilityRisk = this.predict(this.volatilityModel, features);
    const reversalSignal = this.predict(this.reversalModel, features);

    // Calculate confidence based on model agreement
    const predictions = [trendProbability, volatilityRisk, reversalSignal];
    const variance = predictions.reduce((sum, pred) => sum + Math.pow(pred - 0.5, 2), 0) / predictions.length;
    const confidence = Math.min(variance * 4, 1); // Scale to 0-1

    // Generate recommendation
    let recommendation: 'BUY_ETH3L' | 'BUY_ETH3S' | 'SELL_ETH3L' | 'SELL_ETH3S' | 'HOLD';

    if (trendProbability > 0.7 && volatilityRisk < 0.4 && confidence > 0.6) {
      recommendation = 'BUY_ETH3L'; // Strong uptrend, low volatility
    } else if (trendProbability < 0.3 && volatilityRisk < 0.4 && confidence > 0.6) {
      recommendation = 'BUY_ETH3S'; // Strong downtrend, low volatility
    } else if (reversalSignal > 0.8 && features.rsi > 70) {
      recommendation = 'SELL_ETH3L'; // Overbought reversal
    } else if (reversalSignal > 0.8 && features.rsi < 30) {
      recommendation = 'SELL_ETH3S'; // Oversold reversal
    } else {
      recommendation = 'HOLD';
    }

    return {
      trendProbability,
      volatilityRisk,
      reversalSignal,
      confidence,
      recommendation
    };
  }

  public addTrainingData(candlestick: any): void {
    if (this.trainingData.length > 0) {
      const lastData = this.trainingData[this.trainingData.length - 1];
      const timeDiff = candlestick.openTime - lastData.timestamp;
      
      // Only add if it's a new candlestick (1 minute apart)
      if (timeDiff >= 60000) {
        // Update target for previous data point
        const prevPrice = this.trainingData.length > 0 ? 
          this.trainingData[this.trainingData.length - 1].features.priceChange : 0;
        
        if (this.trainingData.length > 20) {
          const history = this.trainingData.slice(-20);
          const features = this.extractFeatures(candlestick, history.map(h => ({
            close: h.features.priceChange,
            volume: h.features.volume,
            openTime: h.timestamp
          })));

          this.trainingData.push({
            features,
            target: 0, // Will be updated when next candlestick arrives
            timestamp: candlestick.openTime
          });

          // Keep only last 5000 samples
          if (this.trainingData.length > 5000) {
            this.trainingData = this.trainingData.slice(-5000);
          }
        }
      }
    }
  }

  public getModelStats(): {
    trendAccuracy: number;
    volatilityAccuracy: number;
    reversalAccuracy: number;
    trainingDataSize: number;
  } {
    return {
      trendAccuracy: this.trendModel.accuracy,
      volatilityAccuracy: this.volatilityModel.accuracy,
      reversalAccuracy: this.reversalModel.accuracy,
      trainingDataSize: this.trainingData.length
    };
  }
}

export const mlEngine = new MLEngine();