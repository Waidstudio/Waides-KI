/**
 * Test Dataset Manager - AI Model Testing Infrastructure
 * Manages test datasets for all 6 trading entities with validation
 */

export interface TestDataset {
  id: string;
  entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon';
  marketConditions: 'bull' | 'bear' | 'sideways' | 'volatile' | 'flash_crash';
  timeRange: {
    start: Date;
    end: Date;
    duration: string;
  };
  validated: boolean;
  results: TestResults;
  dataPoints: number;
  source: 'binance' | 'coinbase' | 'historical' | 'synthetic';
}

export interface TestResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  profitability: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  winRate: number;
  avgTradeReturn: number;
}

export interface MarketConditionData {
  price: number;
  volume: number;
  volatility: number;
  trend: 'up' | 'down' | 'sideways';
  rsi: number;
  macd: number;
  timestamp: number;
}

export class TestDataManager {
  private testDatasets: Map<string, TestDataset> = new Map();
  private validationThresholds = {
    minAccuracy: 0.60,
    minPrecision: 0.55,
    minSharpeRatio: 0.5,
    maxDrawdown: 0.20,
    minDataPoints: 1000
  };

  constructor() {
    this.initializeDefaultDatasets();
  }

  private initializeDefaultDatasets(): void {
    // Initialize test datasets for each entity
    const entities: ('alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon')[] = 
      ['alpha', 'beta', 'gamma', 'omega', 'delta', 'epsilon'];

    const marketConditions: ('bull' | 'bear' | 'sideways' | 'volatile' | 'flash_crash')[] = 
      ['bull', 'bear', 'sideways', 'volatile', 'flash_crash'];

    entities.forEach(entity => {
      marketConditions.forEach(condition => {
        const dataset: TestDataset = {
          id: `${entity}_${condition}_${Date.now()}`,
          entity,
          marketConditions: condition,
          timeRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date(),
            duration: '30d'
          },
          validated: false,
          results: this.generateInitialResults(),
          dataPoints: 0,
          source: 'historical'
        };
        
        this.testDatasets.set(dataset.id, dataset);
      });
    });

    console.log(`🧪 Initialized ${this.testDatasets.size} test datasets across all entities`);
  }

  private generateInitialResults(): TestResults {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      profitability: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      totalTrades: 0,
      winRate: 0,
      avgTradeReturn: 0
    };
  }

  public async createTestDataset(
    entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon',
    marketCondition: 'bull' | 'bear' | 'sideways' | 'volatile' | 'flash_crash',
    startDate: Date,
    endDate: Date,
    source: 'binance' | 'coinbase' | 'historical' = 'historical'
  ): Promise<TestDataset> {
    const dataset: TestDataset = {
      id: `${entity}_${marketCondition}_${Date.now()}`,
      entity,
      marketConditions: marketCondition,
      timeRange: {
        start: startDate,
        end: endDate,
        duration: this.calculateDuration(startDate, endDate)
      },
      validated: false,
      results: this.generateInitialResults(),
      dataPoints: 0,
      source
    };

    // Load actual market data based on source
    const marketData = await this.loadMarketData(startDate, endDate, source, marketCondition);
    dataset.dataPoints = marketData.length;

    this.testDatasets.set(dataset.id, dataset);
    console.log(`📊 Created test dataset for ${entity} - ${marketCondition} (${dataset.dataPoints} points)`);

    return dataset;
  }

  private async loadMarketData(
    startDate: Date, 
    endDate: Date, 
    source: string, 
    condition: string
  ): Promise<MarketConditionData[]> {
    // In a real implementation, this would fetch actual market data
    // For now, generate realistic test data based on market conditions
    const data: MarketConditionData[] = [];
    const timeDiff = endDate.getTime() - startDate.getTime();
    const intervals = Math.floor(timeDiff / (5 * 60 * 1000)); // 5-minute intervals

    let basePrice = 3000; // Starting ETH price
    
    for (let i = 0; i < intervals && i < 10000; i++) {
      const timestamp = startDate.getTime() + (i * 5 * 60 * 1000);
      
      // Generate price movement based on market condition
      const priceChange = this.generatePriceChange(condition, i);
      basePrice += priceChange;
      
      data.push({
        price: basePrice,
        volume: Math.random() * 1000000 + 100000,
        volatility: this.calculateVolatility(condition),
        trend: this.getTrend(condition, i),
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 100,
        timestamp
      });
    }

    return data;
  }

  private generatePriceChange(condition: string, index: number): number {
    switch (condition) {
      case 'bull':
        return (Math.random() * 10 - 3); // Mostly upward
      case 'bear':
        return (Math.random() * 10 - 7); // Mostly downward
      case 'sideways':
        return (Math.random() * 6 - 3); // Balanced
      case 'volatile':
        return (Math.random() * 20 - 10); // High volatility
      case 'flash_crash':
        return index % 100 === 50 ? -200 : (Math.random() * 6 - 3); // Occasional crashes
      default:
        return (Math.random() * 6 - 3);
    }
  }

  private calculateVolatility(condition: string): number {
    switch (condition) {
      case 'volatile':
      case 'flash_crash':
        return Math.random() * 0.05 + 0.03;
      case 'sideways':
        return Math.random() * 0.01 + 0.005;
      default:
        return Math.random() * 0.02 + 0.01;
    }
  }

  private getTrend(condition: string, index: number): 'up' | 'down' | 'sideways' {
    switch (condition) {
      case 'bull':
        return Math.random() > 0.3 ? 'up' : 'sideways';
      case 'bear':
        return Math.random() > 0.3 ? 'down' : 'sideways';
      case 'sideways':
        return 'sideways';
      default:
        const rand = Math.random();
        return rand > 0.66 ? 'up' : rand > 0.33 ? 'down' : 'sideways';
    }
  }

  private calculateDuration(start: Date, end: Date): string {
    const days = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return `${days}d`;
  }

  public async validateTestDataset(datasetId: string, results: TestResults): Promise<boolean> {
    const dataset = this.testDatasets.get(datasetId);
    if (!dataset) {
      throw new Error(`Test dataset not found: ${datasetId}`);
    }

    // Apply validation thresholds
    const isValid = 
      results.accuracy >= this.validationThresholds.minAccuracy &&
      results.precision >= this.validationThresholds.minPrecision &&
      results.sharpeRatio >= this.validationThresholds.minSharpeRatio &&
      results.maxDrawdown <= this.validationThresholds.maxDrawdown &&
      dataset.dataPoints >= this.validationThresholds.minDataPoints;

    dataset.results = results;
    dataset.validated = isValid;

    console.log(`✅ Validation ${isValid ? 'PASSED' : 'FAILED'} for ${dataset.entity} - ${dataset.marketConditions}`);
    
    return isValid;
  }

  public getTestDatasets(entity?: string): TestDataset[] {
    const datasets = Array.from(this.testDatasets.values());
    return entity ? datasets.filter(d => d.entity === entity) : datasets;
  }

  public getValidatedDatasets(entity?: string): TestDataset[] {
    return this.getTestDatasets(entity).filter(d => d.validated);
  }

  public async runTestSuite(entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon'): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallScore: number;
    details: TestDataset[];
  }> {
    const entityDatasets = this.getTestDatasets(entity);
    let passed = 0;
    let failed = 0;

    for (const dataset of entityDatasets) {
      // Simulate running the model on the dataset
      const mockResults = await this.simulateModelTest(dataset);
      const isValid = await this.validateTestDataset(dataset.id, mockResults);
      
      if (isValid) {
        passed++;
      } else {
        failed++;
      }
    }

    const overallScore = entityDatasets.length > 0 ? (passed / entityDatasets.length) * 100 : 0;

    console.log(`🎯 Test Suite Results for ${entity}: ${passed}/${entityDatasets.length} passed (${overallScore.toFixed(1)}%)`);

    return {
      totalTests: entityDatasets.length,
      passedTests: passed,
      failedTests: failed,
      overallScore,
      details: entityDatasets
    };
  }

  private async simulateModelTest(dataset: TestDataset): Promise<TestResults> {
    // Simulate model performance based on entity and market condition
    const baseAccuracy = this.getBaseAccuracy(dataset.entity, dataset.marketConditions);
    
    return {
      accuracy: baseAccuracy + (Math.random() * 0.1 - 0.05),
      precision: baseAccuracy + (Math.random() * 0.08 - 0.04),
      recall: baseAccuracy + (Math.random() * 0.06 - 0.03),
      f1Score: baseAccuracy + (Math.random() * 0.07 - 0.035),
      profitability: (Math.random() * 0.3 - 0.1), // -10% to +20%
      maxDrawdown: Math.random() * 0.25,
      sharpeRatio: Math.random() * 2 - 0.5,
      totalTrades: Math.floor(Math.random() * 100 + 10),
      winRate: baseAccuracy + (Math.random() * 0.1 - 0.05),
      avgTradeReturn: (Math.random() * 0.04 - 0.01) // -1% to +3% per trade
    };
  }

  private getBaseAccuracy(entity: string, condition: string): number {
    // Different entities have different base accuracies for different conditions
    const entityMultipliers = {
      'alpha': 0.6,     // Basic bot
      'beta': 0.65,     // Pro bot
      'gamma': 0.7,     // Autonomous trader
      'omega': 0.75,    // Full engine with ML
      'delta': 0.72,    // Energy distribution
      'epsilon': 0.58   // Backup system
    };

    const conditionMultipliers = {
      'bull': 1.0,
      'bear': 0.9,
      'sideways': 0.8,
      'volatile': 0.7,
      'flash_crash': 0.5
    };

    return (entityMultipliers[entity as keyof typeof entityMultipliers] || 0.6) * 
           (conditionMultipliers[condition as keyof typeof conditionMultipliers] || 1.0);
  }

  public getTestDatasetStats(): {
    totalDatasets: number;
    validatedDatasets: number;
    entitiesCovered: string[];
    conditionsCovered: string[];
    averageAccuracy: number;
  } {
    const datasets = Array.from(this.testDatasets.values());
    const validated = datasets.filter(d => d.validated);
    
    const entities = Array.from(new Set(datasets.map(d => d.entity)));
    const conditions = Array.from(new Set(datasets.map(d => d.marketConditions)));
    
    const avgAccuracy = validated.length > 0 
      ? validated.reduce((sum, d) => sum + d.results.accuracy, 0) / validated.length 
      : 0;

    return {
      totalDatasets: datasets.length,
      validatedDatasets: validated.length,
      entitiesCovered: entities,
      conditionsCovered: conditions,
      averageAccuracy: avgAccuracy
    };
  }
}

// Export singleton instance
let testDataManagerInstance: TestDataManager | null = null;

export function getTestDataManager(): TestDataManager {
  if (!testDataManagerInstance) {
    testDataManagerInstance = new TestDataManager();
  }
  return testDataManagerInstance;
}