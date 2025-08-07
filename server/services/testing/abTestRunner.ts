/**
 * A/B Test Runner - Live A/B Model Testing System
 * Runs A/B tests for AI models across all 6 trading entities
 */

export interface ABTest {
  id: string;
  name: string;
  description: string;
  entity: string;
  status: 'draft' | 'running' | 'completed' | 'paused' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  plannedDuration: number;    // Duration in days
  trafficSplit: number;       // 0-1, percentage of traffic to variant
  variants: TestVariant[];
  metrics: TestMetric[];
  results?: TestResults;
  createdBy: string;
  lastUpdated: Date;
}

export interface TestVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  modelConfig: ModelConfiguration;
  trafficAllocation: number;  // 0-1
  status: 'active' | 'inactive';
}

export interface ModelConfiguration {
  modelType: 'neural_network' | 'ensemble' | 'gradient_boosting' | 'svm' | 'spiritual_ai';
  parameters: Record<string, any>;
  features: string[];
  thresholds: Record<string, number>;
  riskSettings: Record<string, number>;
}

export interface TestMetric {
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'performance' | 'risk';
  target: number;             // Target value
  significance: number;       // Required significance level (0-1)
  primaryMetric: boolean;     // Is this the primary metric?
}

export interface TestResults {
  totalSamples: number;
  samplesByVariant: Record<string, number>;
  metrics: Record<string, VariantMetricResult>;
  statisticalSignificance: Record<string, number>;
  confidence: number;
  winningVariant?: string;
  recommendation: string;
  detailedAnalysis: string;
  generatedAt: Date;
}

export interface VariantMetricResult {
  control: MetricValue;
  variants: Record<string, MetricValue>;
  improvement: Record<string, number>;
  pValue: Record<string, number>;
  confidenceInterval: Record<string, [number, number]>;
}

export interface MetricValue {
  value: number;
  samples: number;
  standardError: number;
  variance: number;
}

export interface TestExecution {
  testId: string;
  variantId: string;
  entity: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  inputData: Record<string, any>;
  prediction: number;
  confidence: number;
  actualOutcome?: number;
  conversionValue?: number;
  executionTime: number;
  metadata: Record<string, any>;
}

export class ABTestRunner {
  private activeTests = new Map<string, ABTest>();
  private testExecutions: TestExecution[] = [];
  private variantAssignments = new Map<string, string>(); // sessionId -> variantId
  private readonly MAX_EXECUTIONS_HISTORY = 100000;

  constructor() {
    this.startPeriodicAnalysis();
    console.log('🧪 A/B Test Runner initialized for live model testing');
  }

  public createTest(testConfig: Omit<ABTest, 'id' | 'status' | 'createdBy' | 'lastUpdated'>): string {
    const testId = `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate test configuration
    this.validateTestConfig(testConfig);

    const test: ABTest = {
      ...testConfig,
      id: testId,
      status: 'draft',
      createdBy: 'system', // Would be actual user in production
      lastUpdated: new Date()
    };

    this.activeTests.set(testId, test);
    
    console.log(`🧪 Created A/B test: ${test.name} for entity ${test.entity}`);
    
    return testId;
  }

  private validateTestConfig(config: Omit<ABTest, 'id' | 'status' | 'createdBy' | 'lastUpdated'>): void {
    // Validate variants
    if (config.variants.length < 2) {
      throw new Error('A/B test must have at least 2 variants (control + 1 treatment)');
    }

    const controlVariants = config.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('A/B test must have exactly 1 control variant');
    }

    // Validate traffic allocation
    const totalAllocation = config.variants.reduce((sum, v) => sum + v.trafficAllocation, 0);
    if (Math.abs(totalAllocation - 1.0) > 0.01) {
      throw new Error('Variant traffic allocations must sum to 1.0');
    }

    // Validate metrics
    if (config.metrics.length === 0) {
      throw new Error('A/B test must have at least 1 metric');
    }

    const primaryMetrics = config.metrics.filter(m => m.primaryMetric);
    if (primaryMetrics.length !== 1) {
      throw new Error('A/B test must have exactly 1 primary metric');
    }

    // Validate duration
    if (config.plannedDuration <= 0) {
      throw new Error('Test duration must be positive');
    }
  }

  public startTest(testId: string): boolean {
    const test = this.activeTests.get(testId);
    if (!test) {
      console.error(`Test not found: ${testId}`);
      return false;
    }

    if (test.status !== 'draft') {
      console.error(`Cannot start test in status: ${test.status}`);
      return false;
    }

    test.status = 'running';
    test.startDate = new Date();
    test.lastUpdated = new Date();

    console.log(`🚀 Started A/B test: ${test.name}`);
    return true;
  }

  public assignVariant(
    testId: string,
    sessionId: string,
    userId?: string
  ): TestVariant | null {
    
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if already assigned
    const existingAssignment = this.variantAssignments.get(sessionId);
    if (existingAssignment) {
      const variant = test.variants.find(v => v.id === existingAssignment);
      if (variant) return variant;
    }

    // Assign variant based on traffic allocation
    const random = Math.random();
    let cumulativeAllocation = 0;

    for (const variant of test.variants) {
      cumulativeAllocation += variant.trafficAllocation;
      if (random <= cumulativeAllocation && variant.status === 'active') {
        this.variantAssignments.set(sessionId, variant.id);
        return variant;
      }
    }

    // Fallback to control
    const controlVariant = test.variants.find(v => v.isControl);
    if (controlVariant) {
      this.variantAssignments.set(sessionId, controlVariant.id);
    }
    
    return controlVariant || null;
  }

  public recordExecution(
    testId: string,
    variantId: string,
    entity: string,
    sessionId: string,
    inputData: Record<string, any>,
    prediction: number,
    confidence: number,
    executionTime: number,
    metadata: Record<string, any> = {}
  ): string {
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: TestExecution = {
      testId,
      variantId,
      entity,
      sessionId,
      timestamp: new Date(),
      inputData,
      prediction,
      confidence,
      executionTime,
      metadata
    };

    this.testExecutions.push(execution);

    // Trim executions to prevent memory issues
    if (this.testExecutions.length > this.MAX_EXECUTIONS_HISTORY) {
      this.testExecutions = this.testExecutions.slice(-this.MAX_EXECUTIONS_HISTORY);
    }

    return executionId;
  }

  public recordOutcome(
    sessionId: string,
    actualOutcome: number,
    conversionValue: number = 0
  ): boolean {
    
    // Find the most recent execution for this session
    const execution = this.testExecutions
      .filter(e => e.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!execution) {
      console.warn(`No execution found for session: ${sessionId}`);
      return false;
    }

    execution.actualOutcome = actualOutcome;
    execution.conversionValue = conversionValue;

    console.log(`📊 Recorded outcome for test ${execution.testId}: ${actualOutcome}`);
    return true;
  }

  public analyzeTest(testId: string): TestResults | null {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    const executions = this.getTestExecutions(testId);
    if (executions.length < 50) { // Need minimum sample size
      console.warn(`Insufficient data for test ${testId}: ${executions.length} executions`);
      return null;
    }

    // Group executions by variant
    const executionsByVariant = new Map<string, TestExecution[]>();
    executions.forEach(exec => {
      if (!executionsByVariant.has(exec.variantId)) {
        executionsByVariant.set(exec.variantId, []);
      }
      executionsByVariant.get(exec.variantId)!.push(exec);
    });

    // Calculate metrics for each variant
    const metricResults: Record<string, VariantMetricResult> = {};
    const controlVariant = test.variants.find(v => v.isControl)!;
    
    test.metrics.forEach(metric => {
      const results = this.calculateMetricResults(
        metric,
        executionsByVariant,
        controlVariant.id
      );
      metricResults[metric.name] = results;
    });

    // Calculate statistical significance
    const statisticalSignificance: Record<string, number> = {};
    test.metrics.forEach(metric => {
      const result = metricResults[metric.name];
      Object.keys(result.pValue).forEach(variantId => {
        if (variantId !== controlVariant.id) {
          statisticalSignificance[`${metric.name}_${variantId}`] = 1 - result.pValue[variantId];
        }
      });
    });

    // Determine winning variant and confidence
    const { winningVariant, confidence } = this.determineWinningVariant(
      test,
      metricResults,
      statisticalSignificance
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      test,
      metricResults,
      statisticalSignificance,
      winningVariant,
      confidence
    );

    const results: TestResults = {
      totalSamples: executions.length,
      samplesByVariant: this.getSamplesByVariant(executionsByVariant),
      metrics: metricResults,
      statisticalSignificance,
      confidence,
      winningVariant,
      recommendation,
      detailedAnalysis: this.generateDetailedAnalysis(test, metricResults, statisticalSignificance),
      generatedAt: new Date()
    };

    test.results = results;
    test.lastUpdated = new Date();

    console.log(`📈 Analyzed test ${test.name}: ${recommendation}`);

    return results;
  }

  private calculateMetricResults(
    metric: TestMetric,
    executionsByVariant: Map<string, TestExecution[]>,
    controlVariantId: string
  ): VariantMetricResult {
    
    const control = this.calculateMetricValue(metric, executionsByVariant.get(controlVariantId) || []);
    const variants: Record<string, MetricValue> = {};
    const improvement: Record<string, number> = {};
    const pValue: Record<string, number> = {};
    const confidenceInterval: Record<string, [number, number]> = {};

    executionsByVariant.forEach((executions, variantId) => {
      if (variantId === controlVariantId) return;

      const variantValue = this.calculateMetricValue(metric, executions);
      variants[variantId] = variantValue;

      // Calculate improvement
      improvement[variantId] = control.value !== 0 
        ? (variantValue.value - control.value) / Math.abs(control.value)
        : 0;

      // Calculate statistical significance (simplified t-test)
      pValue[variantId] = this.calculatePValue(control, variantValue);

      // Calculate confidence interval
      confidenceInterval[variantId] = this.calculateConfidenceInterval(
        variantValue.value,
        variantValue.standardError,
        0.95 // 95% confidence
      );
    });

    return {
      control,
      variants,
      improvement,
      pValue,
      confidenceInterval
    };
  }

  private calculateMetricValue(metric: TestMetric, executions: TestExecution[]): MetricValue {
    if (executions.length === 0) {
      return { value: 0, samples: 0, standardError: 0, variance: 0 };
    }

    let values: number[] = [];

    switch (metric.type) {
      case 'conversion':
        values = executions.map(e => e.actualOutcome !== undefined ? (e.actualOutcome > 0 ? 1 : 0) : 0);
        break;
      case 'revenue':
        values = executions.map(e => e.conversionValue || 0);
        break;
      case 'performance':
        values = executions.map(e => e.confidence);
        break;
      case 'engagement':
        values = executions.map(e => e.prediction);
        break;
      case 'risk':
        values = executions.map(e => Math.abs(e.prediction - (e.actualOutcome || 0)));
        break;
      default:
        values = executions.map(e => e.prediction);
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardError = Math.sqrt(variance / values.length);

    return {
      value: mean,
      samples: values.length,
      standardError,
      variance
    };
  }

  private calculatePValue(control: MetricValue, variant: MetricValue): number {
    // Simplified t-test calculation
    if (control.samples < 2 || variant.samples < 2) return 1.0;

    const pooledVariance = (
      (control.samples - 1) * control.variance + 
      (variant.samples - 1) * variant.variance
    ) / (control.samples + variant.samples - 2);

    const standardError = Math.sqrt(
      pooledVariance * (1/control.samples + 1/variant.samples)
    );

    if (standardError === 0) return 1.0;

    const tStatistic = Math.abs(variant.value - control.value) / standardError;
    const degreesOfFreedom = control.samples + variant.samples - 2;

    // Simplified p-value calculation (would use proper t-distribution in production)
    const pValue = Math.max(0.001, Math.min(1.0, 2 * (1 - this.normalCDF(tStatistic))));
    return pValue;
  }

  private normalCDF(x: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private calculateConfidenceInterval(
    mean: number,
    standardError: number,
    confidence: number
  ): [number, number] {
    
    const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
    const margin = zScore * standardError;
    
    return [mean - margin, mean + margin];
  }

  private determineWinningVariant(
    test: ABTest,
    metricResults: Record<string, VariantMetricResult>,
    statisticalSignificance: Record<string, number>
  ): { winningVariant?: string; confidence: number } {
    
    const primaryMetric = test.metrics.find(m => m.primaryMetric)!;
    const primaryResult = metricResults[primaryMetric.name];
    
    let bestVariant = '';
    let bestImprovement = -Infinity;
    let overallConfidence = 0;

    Object.keys(primaryResult.improvement).forEach(variantId => {
      const improvement = primaryResult.improvement[variantId];
      const significance = statisticalSignificance[`${primaryMetric.name}_${variantId}`];
      
      if (improvement > bestImprovement && significance >= primaryMetric.significance) {
        bestVariant = variantId;
        bestImprovement = improvement;
        overallConfidence = significance;
      }
    });

    return {
      winningVariant: bestVariant || undefined,
      confidence: overallConfidence
    };
  }

  private generateRecommendation(
    test: ABTest,
    metricResults: Record<string, VariantMetricResult>,
    statisticalSignificance: Record<string, number>,
    winningVariant?: string,
    confidence: number = 0
  ): string {
    
    if (!winningVariant) {
      return 'No statistically significant winner detected. Consider running test longer or adjusting variants.';
    }

    const primaryMetric = test.metrics.find(m => m.primaryMetric)!;
    const improvement = metricResults[primaryMetric.name].improvement[winningVariant];
    const improvementPercent = (improvement * 100).toFixed(1);

    if (confidence >= 0.95) {
      return `Strong recommendation: Deploy variant ${winningVariant}. Shows ${improvementPercent}% improvement in ${primaryMetric.name} with ${(confidence * 100).toFixed(1)}% confidence.`;
    } else if (confidence >= 0.80) {
      return `Moderate recommendation: Consider deploying variant ${winningVariant}. Shows ${improvementPercent}% improvement but confidence is ${(confidence * 100).toFixed(1)}%.`;
    } else {
      return `Weak signal: Variant ${winningVariant} shows ${improvementPercent}% improvement but with low confidence (${(confidence * 100).toFixed(1)}%). Recommend continuing test.`;
    }
  }

  private generateDetailedAnalysis(
    test: ABTest,
    metricResults: Record<string, VariantMetricResult>,
    statisticalSignificance: Record<string, number>
  ): string {
    
    const analysis: string[] = [];
    
    analysis.push(`A/B Test Analysis for: ${test.name}`);
    analysis.push(`Entity: ${test.entity}`);
    analysis.push(`Duration: ${Math.ceil((Date.now() - test.startDate.getTime()) / (24 * 60 * 60 * 1000))} days`);
    analysis.push('');

    test.metrics.forEach(metric => {
      const result = metricResults[metric.name];
      analysis.push(`${metric.name} (${metric.type}):`);
      analysis.push(`  Control: ${result.control.value.toFixed(4)} (${result.control.samples} samples)`);
      
      Object.keys(result.variants).forEach(variantId => {
        const variant = result.variants[variantId];
        const improvement = result.improvement[variantId];
        const significance = statisticalSignificance[`${metric.name}_${variantId}`];
        
        analysis.push(`  Variant ${variantId}: ${variant.value.toFixed(4)} (${variant.samples} samples)`);
        analysis.push(`    Improvement: ${(improvement * 100).toFixed(2)}%`);
        analysis.push(`    Significance: ${(significance * 100).toFixed(1)}%`);
        analysis.push(`    P-value: ${result.pValue[variantId].toFixed(4)}`);
      });
      
      analysis.push('');
    });

    return analysis.join('\n');
  }

  private getSamplesByVariant(executionsByVariant: Map<string, TestExecution[]>): Record<string, number> {
    const samples: Record<string, number> = {};
    executionsByVariant.forEach((executions, variantId) => {
      samples[variantId] = executions.length;
    });
    return samples;
  }

  private getTestExecutions(testId: string): TestExecution[] {
    return this.testExecutions.filter(e => e.testId === testId);
  }

  private startPeriodicAnalysis(): void {
    setInterval(() => {
      this.activeTests.forEach((test, testId) => {
        if (test.status === 'running') {
          // Check if test should be auto-analyzed
          const runDays = (Date.now() - test.startDate.getTime()) / (24 * 60 * 60 * 1000);
          if (runDays >= test.plannedDuration) {
            this.analyzeTest(testId);
          }
        }
      });
    }, 60 * 60 * 1000); // Check every hour
  }

  public stopTest(testId: string): boolean {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') {
      return false;
    }

    test.status = 'completed';
    test.endDate = new Date();
    test.lastUpdated = new Date();

    // Perform final analysis
    this.analyzeTest(testId);

    console.log(`⏹️ Stopped A/B test: ${test.name}`);
    return true;
  }

  public getActiveTests(entity?: string): ABTest[] {
    const tests = Array.from(this.activeTests.values()).filter(t => t.status === 'running');
    return entity ? tests.filter(t => t.entity === entity) : tests;
  }

  public getTestResults(testId: string): TestResults | null {
    const test = this.activeTests.get(testId);
    return test?.results || null;
  }

  public getTestStatistics(): {
    totalTests: number;
    runningTests: number;
    completedTests: number;
    totalExecutions: number;
    entitiesTested: string[];
    averageTestDuration: number;
  } {
    
    const tests = Array.from(this.activeTests.values());
    const runningTests = tests.filter(t => t.status === 'running');
    const completedTests = tests.filter(t => t.status === 'completed');
    const entitiesTested = Array.from(new Set(tests.map(t => t.entity)));
    
    const avgDuration = completedTests.length > 0
      ? completedTests.reduce((sum, test) => {
          if (test.endDate) {
            return sum + (test.endDate.getTime() - test.startDate.getTime());
          }
          return sum;
        }, 0) / completedTests.length / (24 * 60 * 60 * 1000) // Convert to days
      : 0;

    return {
      totalTests: tests.length,
      runningTests: runningTests.length,
      completedTests: completedTests.length,
      totalExecutions: this.testExecutions.length,
      entitiesTested,
      averageTestDuration: avgDuration
    };
  }
}

// Export singleton instance
let abTestRunnerInstance: ABTestRunner | null = null;

export function getABTestRunner(): ABTestRunner {
  if (!abTestRunnerInstance) {
    abTestRunnerInstance = new ABTestRunner();
  }
  return abTestRunnerInstance;
}