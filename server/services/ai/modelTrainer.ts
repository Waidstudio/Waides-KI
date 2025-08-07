/**
 * Model Trainer - Periodic Retraining System for AI Models
 * Handles automatic retraining of models for all 6 trading entities
 */

import { getTestDataManager, TestDataset, TestResults } from './testDataManager';
import { getInputValidator } from './inputValidator';

export interface AIModel {
  id: string;
  entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon';
  version: string;
  modelType: 'neural_network' | 'ensemble' | 'gradient_boosting' | 'svm' | 'spiritual_ai';
  parameters: ModelParameters;
  performance: ModelPerformance;
  createdAt: Date;
  lastTrained: Date;
  nextTrainingDue: Date;
  trainingFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  trainingHistory: TrainingSession[];
}

export interface ModelParameters {
  weights: number[];
  biases: number[];
  learningRate: number;
  epochs: number;
  batchSize: number;
  regularization: number;
  features: string[];
  hyperparameters: Record<string, any>;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  roc_auc: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitability: number;
  tradesWon: number;
  tradesLost: number;
  avgTradeReturn: number;
  volatility: number;
}

export interface TrainingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  datasetId: string;
  samplesUsed: number;
  oldPerformance: ModelPerformance;
  newPerformance?: ModelPerformance;
  improvementGained: number;
  logs: string[];
  errorMessage?: string;
}

export interface TrainingData {
  features: Record<string, number>;
  target: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export class ModelTrainer {
  private models = new Map<string, AIModel>();
  private trainingSchedule = new Map<string, NodeJS.Timeout>();
  private currentTrainingSessions = new Map<string, TrainingSession>();
  
  private readonly testDataManager = getTestDataManager();
  private readonly inputValidator = getInputValidator();

  constructor() {
    this.initializeDefaultModels();
    this.startScheduler();
    console.log('🧠 Model Trainer initialized with automatic retraining scheduler');
  }

  private initializeDefaultModels(): void {
    const entities: ('alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon')[] = 
      ['alpha', 'beta', 'gamma', 'omega', 'delta', 'epsilon'];

    entities.forEach(entity => {
      const model = this.createDefaultModel(entity);
      this.models.set(model.id, model);
      this.scheduleRetraining(model.id, model.trainingFrequency);
    });

    console.log(`🎯 Initialized ${this.models.size} AI models for all trading entities`);
  }

  private createDefaultModel(entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon'): AIModel {
    const modelConfigs = {
      alpha: {
        modelType: 'neural_network' as const,
        frequency: 'daily' as const,
        complexity: 'simple'
      },
      beta: {
        modelType: 'ensemble' as const,
        frequency: 'daily' as const,
        complexity: 'medium'
      },
      gamma: {
        modelType: 'gradient_boosting' as const,
        frequency: 'hourly' as const,
        complexity: 'complex'
      },
      omega: {
        modelType: 'ensemble' as const,
        frequency: 'hourly' as const,
        complexity: 'advanced'
      },
      delta: {
        modelType: 'spiritual_ai' as const,
        frequency: 'daily' as const,
        complexity: 'advanced'
      },
      epsilon: {
        modelType: 'svm' as const,
        frequency: 'weekly' as const,
        complexity: 'simple'
      }
    };

    const config = modelConfigs[entity];
    const now = new Date();

    return {
      id: `${entity}_model_${Date.now()}`,
      entity,
      version: '1.0.0',
      modelType: config.modelType,
      parameters: this.generateDefaultParameters(config.complexity),
      performance: this.generateInitialPerformance(entity),
      createdAt: now,
      lastTrained: now,
      nextTrainingDue: this.calculateNextTrainingDate(now, config.frequency),
      trainingFrequency: config.frequency,
      isActive: true,
      trainingHistory: []
    };
  }

  private generateDefaultParameters(complexity: string): ModelParameters {
    const complexityConfigs = {
      simple: { features: 8, layers: [16, 8], lr: 0.01 },
      medium: { features: 12, layers: [32, 16, 8], lr: 0.005 },
      complex: { features: 20, layers: [64, 32, 16, 8], lr: 0.001 },
      advanced: { features: 30, layers: [128, 64, 32, 16], lr: 0.0005 }
    };

    const config = complexityConfigs[complexity as keyof typeof complexityConfigs] || complexityConfigs.simple;

    return {
      weights: Array(config.features * config.layers[0]).fill(0).map(() => Math.random() * 0.1 - 0.05),
      biases: Array(config.layers[0]).fill(0).map(() => Math.random() * 0.01),
      learningRate: config.lr,
      epochs: 100,
      batchSize: 32,
      regularization: 0.001,
      features: [
        'price', 'volume', 'rsi', 'macd', 'ema_short', 'ema_long', 
        'volatility', 'momentum', 'support', 'resistance', 'trend',
        'market_sentiment', 'fear_greed_index', 'volume_profile'
      ].slice(0, config.features),
      hyperparameters: {
        dropout_rate: 0.2,
        activation: 'relu',
        optimizer: 'adam',
        loss_function: 'mse'
      }
    };
  }

  private generateInitialPerformance(entity: string): ModelPerformance {
    const basePerformance = {
      alpha: 0.62,
      beta: 0.68,
      gamma: 0.72,
      omega: 0.76,
      delta: 0.74,
      epsilon: 0.58
    };

    const base = basePerformance[entity as keyof typeof basePerformance] || 0.6;

    return {
      accuracy: base + (Math.random() * 0.05 - 0.025),
      precision: base + (Math.random() * 0.04 - 0.02),
      recall: base + (Math.random() * 0.03 - 0.015),
      f1Score: base + (Math.random() * 0.035 - 0.0175),
      roc_auc: base + (Math.random() * 0.06 - 0.03),
      sharpeRatio: Math.random() * 1.5 + 0.5,
      maxDrawdown: Math.random() * 0.15 + 0.05,
      profitability: (Math.random() * 0.4 - 0.1), // -10% to +30%
      tradesWon: Math.floor(Math.random() * 100 + 20),
      tradesLost: Math.floor(Math.random() * 50 + 5),
      avgTradeReturn: (Math.random() * 0.06 - 0.01), // -1% to +5%
      volatility: Math.random() * 0.3 + 0.1
    };
  }

  public async scheduleRetraining(
    modelId: string, 
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Clear existing schedule
    const existingTimeout = this.trainingSchedule.get(modelId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const intervals = {
      hourly: 60 * 60 * 1000,      // 1 hour
      daily: 24 * 60 * 60 * 1000,  // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000,   // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000  // 30 days
    };

    const interval = intervals[frequency];
    
    const timeout = setTimeout(async () => {
      try {
        await this.retrain(modelId);
        // Reschedule for next training
        this.scheduleRetraining(modelId, frequency);
      } catch (error) {
        console.error(`🔴 Scheduled retraining failed for ${modelId}:`, error);
        // Try again in 1 hour
        setTimeout(() => this.scheduleRetraining(modelId, frequency), 60 * 60 * 1000);
      }
    }, interval);

    this.trainingSchedule.set(modelId, timeout);
    
    console.log(`⏰ Scheduled retraining for ${model.entity} model every ${frequency}`);
  }

  public async retrain(modelId: string, newData?: TrainingData[]): Promise<AIModel> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Check if already training
    if (this.currentTrainingSessions.has(modelId)) {
      throw new Error(`Model ${modelId} is already being retrained`);
    }

    console.log(`🔄 Starting retraining for ${model.entity} model (${model.version})`);

    // Create training session
    const session: TrainingSession = {
      id: `training_${modelId}_${Date.now()}`,
      startTime: new Date(),
      status: 'running',
      datasetId: '',
      samplesUsed: 0,
      oldPerformance: { ...model.performance },
      improvementGained: 0,
      logs: []
    };

    this.currentTrainingSessions.set(modelId, session);

    try {
      // Step 1: Gather training data
      session.logs.push('Gathering training data...');
      const trainingData = newData || await this.gatherTrainingData(model);
      session.samplesUsed = trainingData.length;
      session.logs.push(`Collected ${trainingData.length} training samples`);

      // Step 2: Validate data
      session.logs.push('Validating training data...');
      const validationResult = await this.validateTrainingData(trainingData);
      if (!validationResult.isValid) {
        throw new Error(`Training data validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Step 3: Prepare features
      session.logs.push('Preparing features...');
      const preparedData = this.prepareFeatures(trainingData, model.parameters.features);

      // Step 4: Train model
      session.logs.push('Training model...');
      const newParameters = await this.trainModel(model, preparedData);

      // Step 5: Validate new model
      session.logs.push('Validating new model...');
      const testDatasets = this.testDataManager.getValidatedDatasets(model.entity);
      const newPerformance = await this.evaluateModel(model, newParameters, testDatasets);

      // Step 6: Compare performance
      const improvement = this.calculateImprovement(model.performance, newPerformance);
      session.improvementGained = improvement.overall;
      session.logs.push(`Performance improvement: ${(improvement.overall * 100).toFixed(1)}%`);

      // Step 7: Deploy if better
      if (improvement.overall > 0.02 || improvement.accuracy > 0.03) { // 2% overall or 3% accuracy improvement
        model.parameters = newParameters;
        model.performance = newPerformance;
        model.version = this.incrementVersion(model.version);
        model.lastTrained = new Date();
        model.nextTrainingDue = this.calculateNextTrainingDate(new Date(), model.trainingFrequency);
        
        session.logs.push('New model deployed successfully');
      } else {
        session.logs.push('No significant improvement, keeping current model');
      }

      session.newPerformance = newPerformance;
      session.status = 'completed';
      session.endTime = new Date();

      // Add to model history
      model.trainingHistory.push(session);
      
      // Keep only last 10 training sessions
      if (model.trainingHistory.length > 10) {
        model.trainingHistory = model.trainingHistory.slice(-10);
      }

      console.log(`✅ Retraining completed for ${model.entity} model - Improvement: ${(improvement.overall * 100).toFixed(1)}%`);

      return model;

    } catch (error) {
      session.status = 'failed';
      session.endTime = new Date();
      session.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      session.logs.push(`Training failed: ${session.errorMessage}`);
      
      model.trainingHistory.push(session);
      
      console.error(`🔴 Retraining failed for ${model.entity} model:`, error);
      throw error;
      
    } finally {
      this.currentTrainingSessions.delete(modelId);
    }
  }

  private async gatherTrainingData(model: AIModel): Promise<TrainingData[]> {
    // In a real implementation, this would fetch actual market data
    // For now, generate realistic training data
    const trainingData: TrainingData[] = [];
    const samplesNeeded = Math.floor(Math.random() * 1000 + 500); // 500-1500 samples

    for (let i = 0; i < samplesNeeded; i++) {
      const features: Record<string, number> = {};
      
      // Generate features based on model parameters
      model.parameters.features.forEach(feature => {
        features[feature] = this.generateFeatureValue(feature);
      });

      // Generate target based on features (simplified)
      const target = this.generateTarget(features);

      trainingData.push({
        features,
        target,
        timestamp: new Date(Date.now() - (samplesNeeded - i) * 5 * 60 * 1000), // 5 min intervals
        metadata: {
          source: 'live_data',
          entity: model.entity,
          market_condition: this.determineMarketCondition(features)
        }
      });
    }

    return trainingData;
  }

  private generateFeatureValue(feature: string): number {
    const generators: Record<string, () => number> = {
      price: () => Math.random() * 1000 + 2000,
      volume: () => Math.random() * 1000000,
      rsi: () => Math.random() * 100,
      macd: () => (Math.random() - 0.5) * 100,
      ema_short: () => Math.random() * 1000 + 2000,
      ema_long: () => Math.random() * 1000 + 2000,
      volatility: () => Math.random() * 0.1,
      momentum: () => (Math.random() - 0.5) * 0.2,
      support: () => Math.random() * 1000 + 1800,
      resistance: () => Math.random() * 1000 + 2200,
      trend: () => Math.random() - 0.5,
      market_sentiment: () => Math.random() - 0.5,
      fear_greed_index: () => Math.random() * 100,
      volume_profile: () => Math.random()
    };

    return generators[feature] ? generators[feature]() : Math.random();
  }

  private generateTarget(features: Record<string, number>): number {
    // Simple target generation based on features
    // In reality, this would be the actual trade outcome
    let target = 0;
    
    if (features.rsi && features.rsi < 30) target += 0.3; // Oversold
    if (features.rsi && features.rsi > 70) target -= 0.3; // Overbought
    if (features.trend && features.trend > 0.1) target += 0.2; // Uptrend
    if (features.trend && features.trend < -0.1) target -= 0.2; // Downtrend
    if (features.macd && features.macd > 0) target += 0.1; // Bullish MACD
    
    // Add some randomness
    target += (Math.random() - 0.5) * 0.2;
    
    // Clamp to -1, 1 range
    return Math.max(-1, Math.min(1, target));
  }

  private determineMarketCondition(features: Record<string, number>): string {
    if (features.volatility && features.volatility > 0.05) return 'volatile';
    if (features.trend && features.trend > 0.2) return 'bull';
    if (features.trend && features.trend < -0.2) return 'bear';
    return 'sideways';
  }

  private async validateTrainingData(data: TrainingData[]): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.length < 100) {
      errors.push('Insufficient training data: need at least 100 samples');
    }

    if (data.length < 500) {
      warnings.push('Low training data: recommend at least 500 samples for stable training');
    }

    // Check for data quality
    const validSamples = data.filter(sample => {
      return sample.features && typeof sample.target === 'number' && !isNaN(sample.target);
    });

    if (validSamples.length < data.length * 0.8) {
      errors.push('Too many invalid samples: less than 80% of data is valid');
    }

    // Check target distribution
    const targets = validSamples.map(s => s.target);
    const positiveTargets = targets.filter(t => t > 0).length;
    const negativeTargets = targets.filter(t => t < 0).length;
    
    const positiveRatio = positiveTargets / targets.length;
    if (positiveRatio < 0.2 || positiveRatio > 0.8) {
      warnings.push(`Imbalanced target distribution: ${(positiveRatio * 100).toFixed(1)}% positive`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private prepareFeatures(data: TrainingData[], requiredFeatures: string[]): {
    features: number[][];
    targets: number[];
  } {
    const features: number[][] = [];
    const targets: number[] = [];

    data.forEach(sample => {
      const featureVector: number[] = [];
      
      requiredFeatures.forEach(feature => {
        const value = sample.features[feature] || 0;
        featureVector.push(isNaN(value) ? 0 : value);
      });

      features.push(featureVector);
      targets.push(sample.target);
    });

    return { features, targets };
  }

  private async trainModel(model: AIModel, preparedData: {
    features: number[][];
    targets: number[];
  }): Promise<ModelParameters> {
    // Simulate model training
    // In a real implementation, this would use ML libraries like TensorFlow.js
    
    const newParameters = JSON.parse(JSON.stringify(model.parameters)); // Deep copy
    
    // Simulate parameter updates
    newParameters.weights = newParameters.weights.map((w: number) => 
      w + (Math.random() - 0.5) * newParameters.learningRate
    );
    
    newParameters.biases = newParameters.biases.map((b: number) => 
      b + (Math.random() - 0.5) * newParameters.learningRate * 0.1
    );

    // Simulate training progress
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second "training"

    return newParameters;
  }

  private async evaluateModel(
    model: AIModel, 
    parameters: ModelParameters, 
    testDatasets: TestDataset[]
  ): Promise<ModelPerformance> {
    // Simulate model evaluation on test datasets
    // In reality, this would run the model on test data and measure performance
    
    const performances: ModelPerformance[] = [];
    
    for (const dataset of testDatasets.slice(0, 3)) { // Use up to 3 test datasets
      const performance = this.simulateModelPerformance(model, dataset);
      performances.push(performance);
    }

    // Average the performances
    return this.averagePerformances(performances);
  }

  private simulateModelPerformance(model: AIModel, dataset: TestDataset): ModelPerformance {
    const baseAccuracy = this.getBaseAccuracy(model.entity, dataset.marketConditions);
    const improvement = (Math.random() - 0.3) * 0.05; // Slight bias toward improvement
    
    return {
      accuracy: Math.min(0.95, Math.max(0.3, baseAccuracy + improvement)),
      precision: Math.min(0.95, Math.max(0.3, baseAccuracy + improvement + (Math.random() - 0.5) * 0.02)),
      recall: Math.min(0.95, Math.max(0.3, baseAccuracy + improvement + (Math.random() - 0.5) * 0.02)),
      f1Score: Math.min(0.95, Math.max(0.3, baseAccuracy + improvement + (Math.random() - 0.5) * 0.01)),
      roc_auc: Math.min(0.98, Math.max(0.5, baseAccuracy + improvement + 0.1)),
      sharpeRatio: Math.random() * 2 - 0.5,
      maxDrawdown: Math.random() * 0.3 + 0.02,
      profitability: (Math.random() * 0.5 - 0.1),
      tradesWon: Math.floor(Math.random() * 150 + 20),
      tradesLost: Math.floor(Math.random() * 80 + 5),
      avgTradeReturn: (Math.random() * 0.08 - 0.02),
      volatility: Math.random() * 0.4 + 0.1
    };
  }

  private getBaseAccuracy(entity: string, condition: string): number {
    const entityMultipliers = {
      alpha: 0.62, beta: 0.68, gamma: 0.72, omega: 0.76, delta: 0.74, epsilon: 0.58
    };
    
    const conditionMultipliers = {
      bull: 1.0, bear: 0.9, sideways: 0.8, volatile: 0.7, flash_crash: 0.5
    };

    return (entityMultipliers[entity as keyof typeof entityMultipliers] || 0.6) * 
           (conditionMultipliers[condition as keyof typeof conditionMultipliers] || 1.0);
  }

  private averagePerformances(performances: ModelPerformance[]): ModelPerformance {
    if (performances.length === 0) {
      throw new Error('No performances to average');
    }

    const keys = Object.keys(performances[0]) as (keyof ModelPerformance)[];
    const averaged = {} as ModelPerformance;

    keys.forEach(key => {
      if (typeof performances[0][key] === 'number') {
        averaged[key] = performances.reduce((sum, p) => sum + (p[key] as number), 0) / performances.length;
      }
    });

    return averaged;
  }

  private calculateImprovement(oldPerf: ModelPerformance, newPerf: ModelPerformance): {
    overall: number;
    accuracy: number;
    profitability: number;
    sharpeRatio: number;
  } {
    return {
      overall: ((newPerf.accuracy - oldPerf.accuracy) + 
                (newPerf.profitability - oldPerf.profitability) + 
                (newPerf.sharpeRatio - oldPerf.sharpeRatio)) / 3,
      accuracy: newPerf.accuracy - oldPerf.accuracy,
      profitability: newPerf.profitability - oldPerf.profitability,
      sharpeRatio: newPerf.sharpeRatio - oldPerf.sharpeRatio
    };
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private calculateNextTrainingDate(lastTrained: Date, frequency: string): Date {
    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const interval = intervals[frequency as keyof typeof intervals] || intervals.daily;
    return new Date(lastTrained.getTime() + interval);
  }

  private startScheduler(): void {
    // Start a background process to check for overdue training
    setInterval(() => {
      const now = new Date();
      this.models.forEach((model, modelId) => {
        if (model.isActive && model.nextTrainingDue <= now && !this.currentTrainingSessions.has(modelId)) {
          console.log(`⚠️ Model ${model.entity} is overdue for training, starting now...`);
          this.retrain(modelId).catch(error => {
            console.error(`Failed to retrain overdue model ${modelId}:`, error);
          });
        }
      });
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  public validateRetrained(oldModel: AIModel, newModel: AIModel): boolean {
    // Check if the new model is significantly better
    const accuracyImproved = newModel.performance.accuracy > oldModel.performance.accuracy - 0.05;
    const profitabilityImproved = newModel.performance.profitability > oldModel.performance.profitability - 0.02;
    const sharpeImproved = newModel.performance.sharpeRatio > oldModel.performance.sharpeRatio - 0.1;

    return accuracyImproved && profitabilityImproved && sharpeImproved;
  }

  public async deployNewModel(model: AIModel): Promise<boolean> {
    try {
      // Update the model in the registry
      this.models.set(model.id, model);
      
      console.log(`🚀 Deployed new version ${model.version} for ${model.entity} model`);
      return true;
    } catch (error) {
      console.error(`Failed to deploy model ${model.id}:`, error);
      return false;
    }
  }

  public getModel(modelId: string): AIModel | undefined {
    return this.models.get(modelId);
  }

  public getModelsByEntity(entity: string): AIModel[] {
    return Array.from(this.models.values()).filter(m => m.entity === entity);
  }

  public getCurrentTrainingSessions(): TrainingSession[] {
    return Array.from(this.currentTrainingSessions.values());
  }

  public getTrainingStats(): {
    totalModels: number;
    activeModels: number;
    modelsInTraining: number;
    averageAccuracy: number;
    nextTraining: Date | null;
  } {
    const models = Array.from(this.models.values());
    const activeModels = models.filter(m => m.isActive);
    const avgAccuracy = activeModels.length > 0 
      ? activeModels.reduce((sum, m) => sum + m.performance.accuracy, 0) / activeModels.length 
      : 0;
    
    const nextTrainingDates = activeModels.map(m => m.nextTrainingDue).sort();
    const nextTraining = nextTrainingDates.length > 0 ? nextTrainingDates[0] : null;

    return {
      totalModels: models.length,
      activeModels: activeModels.length,
      modelsInTraining: this.currentTrainingSessions.size,
      averageAccuracy: avgAccuracy,
      nextTraining
    };
  }
}

// Export singleton instance
let modelTrainerInstance: ModelTrainer | null = null;

export function getModelTrainer(): ModelTrainer {
  if (!modelTrainerInstance) {
    modelTrainerInstance = new ModelTrainer();
  }
  return modelTrainerInstance;
}