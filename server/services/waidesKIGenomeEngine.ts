import { waidesKIRootMemory } from './waidesKIRootMemory';
import { waidesKIDNAEngine } from './waidesKIDNAEngine';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';
import crypto from 'crypto';

interface BaseIndicators {
  trend: string;
  rsi: number;
  vwap_status: string;
  price: number;
  ema50: number;
  ema200: number;
  volume: number;
}

interface GeneratedStrategy {
  strategy_id: string;
  strategy_code: string;
  dna_id: string;
  source_strategy: string;
  mutation_type: 'RSI_SHIFT' | 'VWAP_FLIP' | 'EMA_ADJUST' | 'VOLUME_TWEAK' | 'HYBRID_COMBO';
  parameters: {
    rsi_threshold: number;
    vwap_requirement: string;
    ema_gap_max: number;
    volume_min: number;
    trend_filter: string;
  };
  creation_timestamp: number;
  test_results: StrategyTestResult[];
  performance_score: number;
  generation: number;
  is_active: boolean;
  parent_lineage: string[];
}

interface StrategyTestResult {
  test_timestamp: number;
  test_data_points: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_return: number;
  max_drawdown: number;
  test_confidence: number;
}

interface MutationConfig {
  rsi_range: { min: number; max: number };
  volume_multiplier_range: { min: number; max: number };
  ema_gap_variance: number;
  mutation_intensity: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'EXPERIMENTAL';
}

export class WaidesKIGenomeEngine {
  private generatedStrategies: Map<string, GeneratedStrategy> = new Map();
  private strategyVault: GeneratedStrategy[] = [];
  private mutationConfig: MutationConfig;
  private generationCounter: number = 1;
  private maxVaultSize: number = 500;

  constructor() {
    this.mutationConfig = {
      rsi_range: { min: 25, max: 75 },
      volume_multiplier_range: { min: 0.5, max: 2.5 },
      ema_gap_variance: 30,
      mutation_intensity: 'MODERATE'
    };
    
    this.startAutogeneration();
  }

  private startAutogeneration(): void {
    // Run strategy generation every 15 minutes
    setInterval(() => {
      this.generateStrategyBatch();
    }, 15 * 60 * 1000);

    // Initial generation after 2 minutes
    setTimeout(() => {
      this.generateStrategyBatch();
    }, 2 * 60 * 1000);
  }

  // CORE MUTATION ALGORITHMS
  private mutateRSI(baseRSI: number, intensity: MutationConfig['mutation_intensity'] = 'MODERATE'): number {
    let variance: number;
    
    switch (intensity) {
      case 'CONSERVATIVE': variance = 3; break;
      case 'MODERATE': variance = 7; break;
      case 'AGGRESSIVE': variance = 12; break;
      case 'EXPERIMENTAL': variance = 20; break;
    }
    
    const shift = (Math.random() - 0.5) * 2 * variance;
    return Math.max(this.mutationConfig.rsi_range.min, 
           Math.min(this.mutationConfig.rsi_range.max, baseRSI + shift));
  }

  private mutateVWAP(baseStatus: string): string {
    // 70% chance to keep same, 30% chance to flip
    return Math.random() < 0.3 ? (baseStatus === 'ABOVE' ? 'BELOW' : 'ABOVE') : baseStatus;
  }

  private mutateEMAGap(baseGap: number, price: number): number {
    const variance = this.mutationConfig.ema_gap_variance;
    const shift = (Math.random() - 0.5) * 2 * variance;
    const newGap = Math.max(5, baseGap + shift);
    
    // Ensure gap makes sense relative to price
    return Math.min(newGap, price * 0.1); // Max 10% of price
  }

  private mutateVolume(baseVolume: number): number {
    const { min, max } = this.mutationConfig.volume_multiplier_range;
    const multiplier = min + Math.random() * (max - min);
    return baseVolume * multiplier;
  }

  private mutateTrend(baseTrend: string): string {
    const trends = ['UPTREND', 'DOWNTREND', 'RANGING'];
    // 80% chance to keep same trend, 20% chance to change
    if (Math.random() < 0.8) return baseTrend;
    return trends.filter(t => t !== baseTrend)[Math.floor(Math.random() * 2)];
  }

  // STRATEGY CREATION ENGINE
  createNewStrategy(baseStrategyId: string, baseIndicators: BaseIndicators): string {
    const mutationType = this.selectMutationType();
    const newStrategyId = this.generateStrategyId();
    
    let mutatedIndicators = { ...baseIndicators };
    
    // Apply mutations based on type
    switch (mutationType) {
      case 'RSI_SHIFT':
        mutatedIndicators.rsi = this.mutateRSI(baseIndicators.rsi);
        break;
      case 'VWAP_FLIP':
        mutatedIndicators.vwap_status = this.mutateVWAP(baseIndicators.vwap_status);
        break;
      case 'EMA_ADJUST':
        const newGap = this.mutateEMAGap(
          Math.abs(baseIndicators.price - baseIndicators.ema50), 
          baseIndicators.price
        );
        mutatedIndicators.ema50 = baseIndicators.price - newGap;
        break;
      case 'VOLUME_TWEAK':
        mutatedIndicators.volume = this.mutateVolume(baseIndicators.volume);
        break;
      case 'HYBRID_COMBO':
        mutatedIndicators.rsi = this.mutateRSI(baseIndicators.rsi, 'AGGRESSIVE');
        mutatedIndicators.vwap_status = this.mutateVWAP(baseIndicators.vwap_status);
        mutatedIndicators.volume = this.mutateVolume(baseIndicators.volume);
        break;
    }

    // Generate DNA for new strategy
    const dnaId = waidesKIDNAEngine.generateDNA({
      trend: mutatedIndicators.trend,
      rsi: mutatedIndicators.rsi,
      vwap_status: mutatedIndicators.vwap_status,
      ema50: mutatedIndicators.ema50,
      ema200: mutatedIndicators.ema200,
      volume: mutatedIndicators.volume,
      price: mutatedIndicators.price,
      timestamp: Date.now()
    });

    // Create strategy code
    const strategyCode = this.generateStrategyCode(mutatedIndicators);
    
    // Get parent lineage
    const parentStrategy = this.generatedStrategies.get(baseStrategyId);
    const parentLineage = parentStrategy ? 
      [...parentStrategy.parent_lineage, baseStrategyId] : 
      [baseStrategyId];

    const newStrategy: GeneratedStrategy = {
      strategy_id: newStrategyId,
      strategy_code: strategyCode,
      dna_id: dnaId,
      source_strategy: baseStrategyId,
      mutation_type: mutationType,
      parameters: {
        rsi_threshold: mutatedIndicators.rsi,
        vwap_requirement: mutatedIndicators.vwap_status,
        ema_gap_max: Math.abs(mutatedIndicators.price - mutatedIndicators.ema50),
        volume_min: mutatedIndicators.volume,
        trend_filter: mutatedIndicators.trend
      },
      creation_timestamp: Date.now(),
      test_results: [],
      performance_score: 0,
      generation: parentStrategy ? parentStrategy.generation + 1 : 1,
      is_active: true,
      parent_lineage: parentLineage
    };

    this.generatedStrategies.set(newStrategyId, newStrategy);
    
    // Log strategy creation
    waidesKIDailyReporter.recordLesson(
      `Generated new strategy ${newStrategyId} via ${mutationType} from ${baseStrategyId}`,
      'STRATEGY',
      'MEDIUM',
      'Genome Engine'
    );

    return newStrategyId;
  }

  private selectMutationType(): GeneratedStrategy['mutation_type'] {
    const types: GeneratedStrategy['mutation_type'][] = [
      'RSI_SHIFT', 'VWAP_FLIP', 'EMA_ADJUST', 'VOLUME_TWEAK', 'HYBRID_COMBO'
    ];
    
    // Weighted selection based on historical success
    const weights = [0.25, 0.2, 0.2, 0.15, 0.2]; // HYBRID_COMBO has equal weight
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return types[i];
    }
    
    return 'RSI_SHIFT'; // Fallback
  }

  private generateStrategyId(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WKS_${timestamp}_${random}`;
  }

  private generateStrategyCode(indicators: BaseIndicators): string {
    const parts: string[] = [];
    
    parts.push(`RSI${indicators.rsi > 50 ? '<' : '>'}${indicators.rsi.toFixed(1)}`);
    parts.push(`VWAP_${indicators.vwap_status}`);
    parts.push(`EMA_GAP<=${Math.abs(indicators.price - indicators.ema50).toFixed(0)}`);
    
    if (indicators.volume > 1000000) {
      parts.push(`VOL>=${(indicators.volume / 1000000).toFixed(1)}M`);
    }
    
    parts.push(`TREND_${indicators.trend}`);
    
    return parts.join(' & ');
  }

  // STRATEGY TESTING ENGINE
  async testGeneratedStrategy(strategyId: string, testData: any[]): Promise<StrategyTestResult> {
    const strategy = this.generatedStrategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    let wins = 0;
    let losses = 0;
    let totalReturn = 0;
    let runningPnL = 0;
    let peak = 0;
    let maxDrawdown = 0;

    // Simulate trades based on strategy parameters
    for (const dataPoint of testData) {
      const shouldTrade = this.evaluateStrategy(strategy, dataPoint);
      
      if (shouldTrade) {
        const outcome = dataPoint.actual_outcome || (Math.random() > 0.6 ? 'win' : 'loss');
        const returnAmount = dataPoint.return_amount || (outcome === 'win' ? 15 + Math.random() * 20 : -(5 + Math.random() * 15));
        
        if (outcome === 'win') {
          wins++;
        } else {
          losses++;
        }
        
        totalReturn += returnAmount;
        runningPnL += returnAmount;
        
        // Track drawdown
        if (runningPnL > peak) peak = runningPnL;
        const drawdown = peak - runningPnL;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
    }

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    // Calculate test confidence based on sample size and consistency
    const testConfidence = this.calculateTestConfidence(totalTrades, winRate, maxDrawdown);

    const testResult: StrategyTestResult = {
      test_timestamp: Date.now(),
      test_data_points: testData.length,
      wins,
      losses,
      win_rate: winRate,
      total_return: totalReturn,
      max_drawdown: maxDrawdown,
      test_confidence: testConfidence
    };

    // Add test result to strategy
    strategy.test_results.push(testResult);
    
    // Update performance score
    strategy.performance_score = this.calculatePerformanceScore(strategy.test_results);
    
    // Keep only recent test results
    if (strategy.test_results.length > 10) {
      strategy.test_results = strategy.test_results.slice(-10);
    }

    return testResult;
  }

  private evaluateStrategy(strategy: GeneratedStrategy, dataPoint: any): boolean {
    const params = strategy.parameters;
    
    // Check all conditions
    const rsiCondition = params.rsi_threshold > 50 ? 
      dataPoint.rsi < params.rsi_threshold : 
      dataPoint.rsi > params.rsi_threshold;
    
    const vwapCondition = dataPoint.vwap_status === params.vwap_requirement;
    
    const emaGapCondition = Math.abs(dataPoint.price - dataPoint.ema50) <= params.ema_gap_max;
    
    const volumeCondition = dataPoint.volume >= params.volume_min;
    
    const trendCondition = dataPoint.trend === params.trend_filter;
    
    // All conditions must be met
    return rsiCondition && vwapCondition && emaGapCondition && volumeCondition && trendCondition;
  }

  private calculateTestConfidence(totalTrades: number, winRate: number, maxDrawdown: number): number {
    let confidence = 30; // Base confidence
    
    // Sample size bonus
    confidence += Math.min(40, totalTrades * 2);
    
    // Performance bonus/penalty
    if (winRate > 60) confidence += 20;
    else if (winRate < 40) confidence -= 15;
    
    // Drawdown penalty
    if (maxDrawdown > 100) confidence -= 20;
    else if (maxDrawdown < 30) confidence += 10;
    
    return Math.max(10, Math.min(95, confidence));
  }

  private calculatePerformanceScore(testResults: StrategyTestResult[]): number {
    if (testResults.length === 0) return 0;
    
    const recentResults = testResults.slice(-5); // Last 5 tests
    let score = 0;
    let totalWeight = 0;
    
    recentResults.forEach((result, index) => {
      const weight = index + 1; // More recent results have higher weight
      const resultScore = (result.win_rate * 0.4) + 
                         (Math.max(0, result.total_return) * 0.3) + 
                         (result.test_confidence * 0.3);
      
      score += resultScore * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? score / totalWeight : 0;
  }

  // BATCH GENERATION AND TESTING
  private async generateStrategyBatch(): Promise<void> {
    try {
      const memoryTree = waidesKIRootMemory.getMemoryTree();
      const successfulStrategies = Object.values(memoryTree)
        .filter(node => node.win_rate > 60 && node.total_trades >= 3)
        .sort((a, b) => b.win_rate - a.win_rate)
        .slice(0, 5); // Top 5 performing strategies

      if (successfulStrategies.length === 0) {
        // No successful strategies yet, create seed strategies
        await this.createSeedStrategies();
        return;
      }

      const batchSize = Math.min(5, successfulStrategies.length);
      const newStrategies: string[] = [];

      for (let i = 0; i < batchSize; i++) {
        const baseStrategy = successfulStrategies[i];
        
        // Create synthetic indicators from memory node
        const baseIndicators: BaseIndicators = {
          trend: 'UPTREND', // Default
          rsi: 50 + (baseStrategy.win_rate - 50) * 0.3, // Derive from performance
          vwap_status: baseStrategy.win_rate > 70 ? 'ABOVE' : 'BELOW',
          price: 2400, // Default ETH price
          ema50: 2380,
          ema200: 2350,
          volume: 1500000
        };

        const newStrategyId = this.createNewStrategy(baseStrategy.strategy_id, baseIndicators);
        newStrategies.push(newStrategyId);
      }

      // Auto-test the new strategies
      await this.autoTestStrategies(newStrategies);
      
      // Update vault with successful strategies
      this.updateStrategyVault();

      waidesKIDailyReporter.logEmotionalState(
        'FOCUSED',
        `Generated and tested ${newStrategies.length} new strategies`,
        'Strategy Generation',
        75
      );

    } catch (error) {
      console.error('Error in strategy generation batch:', error);
    }
  }

  private async createSeedStrategies(): Promise<void> {
    // Create initial seed strategies when no successful strategies exist
    const seedConfigs = [
      { rsi: 45, vwap: 'ABOVE', trend: 'UPTREND' },
      { rsi: 55, vwap: 'ABOVE', trend: 'UPTREND' },
      { rsi: 65, vwap: 'BELOW', trend: 'DOWNTREND' },
      { rsi: 35, vwap: 'BELOW', trend: 'DOWNTREND' },
      { rsi: 50, vwap: 'ABOVE', trend: 'RANGING' }
    ];

    const seedStrategies: string[] = [];

    for (const config of seedConfigs) {
      const baseIndicators: BaseIndicators = {
        trend: config.trend,
        rsi: config.rsi,
        vwap_status: config.vwap,
        price: 2400,
        ema50: 2380,
        ema200: 2350,
        volume: 1500000
      };

      const strategyId = this.createNewStrategy('SEED_ORIGIN', baseIndicators);
      seedStrategies.push(strategyId);
    }

    await this.autoTestStrategies(seedStrategies);
  }

  private async autoTestStrategies(strategyIds: string[]): Promise<void> {
    const testData = this.generateTestData(100); // 100 data points
    
    for (const strategyId of strategyIds) {
      try {
        await this.testGeneratedStrategy(strategyId, testData);
      } catch (error) {
        console.error(`Error testing strategy ${strategyId}:`, error);
      }
    }
  }

  private generateTestData(points: number): any[] {
    const testData = [];
    let basePrice = 2400;
    
    for (let i = 0; i < points; i++) {
      const priceChange = (Math.random() - 0.5) * 100; // ±50 price movement
      basePrice += priceChange;
      
      const rsi = 30 + Math.random() * 40; // 30-70 range
      const trend = Math.random() > 0.6 ? 'UPTREND' : Math.random() > 0.3 ? 'DOWNTREND' : 'RANGING';
      
      testData.push({
        timestamp: Date.now() - (points - i) * 60000, // 1 minute intervals
        price: basePrice,
        rsi,
        vwap_status: Math.random() > 0.5 ? 'ABOVE' : 'BELOW',
        ema50: basePrice - 20 + Math.random() * 40,
        ema200: basePrice - 50 + Math.random() * 100,
        volume: 1000000 + Math.random() * 2000000,
        trend,
        actual_outcome: Math.random() > 0.45 ? 'win' : 'loss', // 55% win rate
        return_amount: Math.random() > 0.45 ? (10 + Math.random() * 25) : -(5 + Math.random() * 20)
      });
    }
    
    return testData;
  }

  // STRATEGY VAULT MANAGEMENT
  private updateStrategyVault(): void {
    // Move high-performing strategies to vault
    for (const [strategyId, strategy] of this.generatedStrategies.entries()) {
      if (strategy.performance_score > 70 && strategy.test_results.length >= 2) {
        // Add to vault if not already there
        const existsInVault = this.strategyVault.some(s => s.strategy_id === strategyId);
        if (!existsInVault) {
          this.strategyVault.push({ ...strategy });
          
          waidesKIDailyReporter.recordLesson(
            `Strategy ${strategyId} added to vault with score ${strategy.performance_score.toFixed(1)}`,
            'STRATEGY',
            'HIGH',
            'Strategy Vault'
          );
        }
      }
    }
    
    // Maintain vault size
    if (this.strategyVault.length > this.maxVaultSize) {
      this.strategyVault.sort((a, b) => b.performance_score - a.performance_score);
      this.strategyVault = this.strategyVault.slice(0, this.maxVaultSize);
    }
    
    // Remove poor performers from active strategies
    for (const [strategyId, strategy] of this.generatedStrategies.entries()) {
      if (strategy.performance_score < 30 && strategy.test_results.length >= 3) {
        strategy.is_active = false;
      }
    }
  }

  // PUBLIC INTERFACE METHODS
  getAllGeneratedStrategies(): GeneratedStrategy[] {
    return Array.from(this.generatedStrategies.values());
  }

  getStrategyVault(): GeneratedStrategy[] {
    return [...this.strategyVault];
  }

  getStrategy(strategyId: string): GeneratedStrategy | null {
    return this.generatedStrategies.get(strategyId) || null;
  }

  getGenerationStatistics(): {
    total_generated: number;
    active_strategies: number;
    vault_strategies: number;
    avg_performance_score: number;
    best_strategy: GeneratedStrategy | null;
    mutation_distribution: { [key: string]: number };
    generation_health: number;
  } {
    const strategies = Array.from(this.generatedStrategies.values());
    const activeStrategies = strategies.filter(s => s.is_active);
    
    const avgScore = strategies.length > 0 ? 
      strategies.reduce((sum, s) => sum + s.performance_score, 0) / strategies.length : 0;
    
    const bestStrategy = strategies.length > 0 ? 
      strategies.reduce((best, current) => 
        current.performance_score > best.performance_score ? current : best
      ) : null;
    
    // Mutation type distribution
    const mutationDist: { [key: string]: number } = {};
    strategies.forEach(s => {
      mutationDist[s.mutation_type] = (mutationDist[s.mutation_type] || 0) + 1;
    });
    
    // Generation health based on active strategies and performance
    const healthScore = Math.min(100, 
      (activeStrategies.length * 2) + 
      (this.strategyVault.length * 3) + 
      (avgScore * 0.5)
    );
    
    return {
      total_generated: strategies.length,
      active_strategies: activeStrategies.length,
      vault_strategies: this.strategyVault.length,
      avg_performance_score: avgScore,
      best_strategy: bestStrategy,
      mutation_distribution: mutationDist,
      generation_health: healthScore
    };
  }

  // ADMIN CONTROLS
  forceGenerateBatch(baseStrategyIds: string[], count: number = 5): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const newStrategies: string[] = [];
        
        for (let i = 0; i < count; i++) {
          const baseId = baseStrategyIds[i % baseStrategyIds.length];
          const memoryNode = waidesKIRootMemory.getNodeInfo(baseId);
          
          if (memoryNode) {
            const baseIndicators: BaseIndicators = {
              trend: 'UPTREND',
              rsi: 50 + (memoryNode.win_rate - 50) * 0.3,
              vwap_status: memoryNode.win_rate > 70 ? 'ABOVE' : 'BELOW',
              price: 2400,
              ema50: 2380,
              ema200: 2350,
              volume: 1500000
            };
            
            const newStrategyId = this.createNewStrategy(baseId, baseIndicators);
            newStrategies.push(newStrategyId);
          }
        }
        
        await this.autoTestStrategies(newStrategies);
        resolve(newStrategies);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  deactivateStrategy(strategyId: string): boolean {
    const strategy = this.generatedStrategies.get(strategyId);
    if (strategy) {
      strategy.is_active = false;
      return true;
    }
    return false;
  }

  reactivateStrategy(strategyId: string): boolean {
    const strategy = this.generatedStrategies.get(strategyId);
    if (strategy) {
      strategy.is_active = true;
      return true;
    }
    return false;
  }

  updateMutationConfig(config: Partial<MutationConfig>): void {
    this.mutationConfig = { ...this.mutationConfig, ...config };
  }

  resetGenomeEngine(): void {
    this.generatedStrategies.clear();
    this.strategyVault.length = 0;
    this.generationCounter = 1;
  }

  exportGenomeData(): any {
    return {
      generated_strategies: Object.fromEntries(this.generatedStrategies),
      strategy_vault: this.strategyVault,
      mutation_config: this.mutationConfig,
      generation_statistics: this.getGenerationStatistics(),
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIGenomeEngine = new WaidesKIGenomeEngine();